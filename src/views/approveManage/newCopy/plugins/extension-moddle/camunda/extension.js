import { isFunction, isObject, some } from 'min-dash';

const WILDCARD = '*';

class CamundaModdleExtension {
  constructor(eventBus) {
    eventBus.on('moddleCopy.canCopyProperty', (context) => {
      const { property, parent } = context;
      return this.canCopyProperty(property, parent);
    });
  }

  /**
   * Check whether to disallow copying property.
   */
  canCopyProperty(property, parent) {
    // (1) check whether property is allowed in parent
    if (isObject(property) && !isAllowedInParent(property, parent)) {
      return false;
    }

    // (2) check more complex scenarios
    if (is(property, 'camunda:InputOutput') && !this.canHostInputOutput(parent)) {
      return false;
    }

    if (isAny(property, ['camunda:Connector', 'camunda:Field']) && !this.canHostConnector(parent)) {
      return false;
    }

    if (is(property, 'camunda:In') && !this.canHostIn(parent)) {
      return false;
    }
  }

  canHostInputOutput(parent) {
    // allowed in camunda:Connector
    const connector = getParent(parent, 'camunda:Connector');

    if (connector) {
      return true;
    }

    // special rules inside bpmn:FlowNode
    const flowNode = getParent(parent, 'bpmn:FlowNode');

    if (!flowNode) {
      return false;
    }

    if (isAny(flowNode, ['bpmn:StartEvent', 'bpmn:Gateway', 'bpmn:BoundaryEvent'])) {
      return false;
    }

    if (is(flowNode, 'bpmn:SubProcess') && flowNode.get('triggeredByEvent')) {
      return false;
    }

    return true;
  }

  canHostConnector(parent) {
    const serviceTaskLike = getParent(parent, 'camunda:ServiceTaskLike');

    if (is(serviceTaskLike, 'bpmn:MessageEventDefinition')) {
      // only allow on throw and end events
      return getParent(parent, 'bpmn:IntermediateThrowEvent') || getParent(parent, 'bpmn:EndEvent');
    }

    return true;
  }

  canHostIn(parent) {
    const callActivity = getParent(parent, 'bpmn:CallActivity');

    if (callActivity) {
      return true;
    }

    const signalEventDefinition = getParent(parent, 'bpmn:SignalEventDefinition');

    if (signalEventDefinition) {
      // only allow on throw and end events
      return getParent(parent, 'bpmn:IntermediateThrowEvent') || getParent(parent, 'bpmn:EndEvent');
    }

    return true;
  }
}

CamundaModdleExtension.$inject = ['eventBus'];

export default CamundaModdleExtension;

// helpers //////////
function is(element, type) {
  return element && isFunction(element.$instanceOf) && element.$instanceOf(type);
}

function isAny(element, types) {
  return some(types, (t) => is(element, t));
}

function getParent(element, type) {
  if (!type) {
    return element.$parent;
  }

  if (is(element, type)) {
    return element;
  }

  if (!element.$parent) {
    return;
  }

  return getParent(element.$parent, type);
}

function isAllowedInParent(property, parent) {
  // (1) find property descriptor
  const descriptor = property.$type && property.$model.getTypeDescriptor(property.$type);

  const allowedIn = descriptor && descriptor.meta && descriptor.meta.allowedIn;

  if (!allowedIn || isWildcard(allowedIn)) {
    return true;
  }

  // (2) check whether property has parent of allowed type
  return some(allowedIn, (type) => getParent(parent, type));
}

function isWildcard(allowedIn) {
  return allowedIn.indexOf(WILDCARD) !== -1;
}
