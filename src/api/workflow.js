import request from '@/utils/request'

//保存并部署
export function deploymentProcess(param) {
  return request({
    url: `/flow/deployment`,
    method: 'post',
    data: param
  })
}


//复制
export function copyDeploymentProcess(param) {
  return request({
    url: `/flow/copyDeployment`,
    method: 'post',
    data: param
  })
}

//获取xml
export function getXmlString(data) {
  return request({
    url: '/flow/xmlString',
    method: 'get',
    params: data
  })
}

export function listDeploy() {
  return request({
    url: '/flow/listDeploy',
    method: 'get'
  })
}

export function removeRepository(id) {
  return request({
    url: '/flow/removeRepository/' + id,
    method: 'delete',
    params: id
  })
}

//批量删除
export function batchRemoveRepository(data) {
  return request({
    url: '/flow/v3/batchRemoveRepository',
    method: 'post',
    data: data
  })
}

//获取工作流节点配置表
export function listFlowExtConfig(data) {
  return request({
    url: '/flow/listFlowExtConfig',
    method: 'post',
    data: data
  })
}

//更新工作流节点配置表
export function updateFlowExtConfig(data) {
  return request({
    url: '/flow/updateFlowExtConfig',
    method: 'post',
    data: data
  })
}

//更新工作流节点配置表
export function updateRepositoryStatus(data) {
  return request({
    url: `/flow/updateRepositoryStatus/${data.configId}`,
    method: 'post',
    data: data
  })
}


