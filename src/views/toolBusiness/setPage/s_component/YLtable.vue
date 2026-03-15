<template>
  <div class="table-config-panel">
    <!-- 配置分组 -->
    <!-- <div class="config-section">
      <div class="section-header">
        <h4 style="color: #276efd">数据表格</h4>
      </div>
      <el-form
        :model="formData"
        :inline="true"
        label-width="auto"
        :rules="formRules"
        class="config-form"
      >
        <div style="width: 100%; display: flex; align-items: center">
          <div
            style="
              width: 3px;
              height: 18px;
              background-color: #276efd;
              margin-right: 5px;
            "
          ></div>
          <h4>基本信息</h4>
        </div>
        <div style="background-color: #e3eefd">
          <el-form-item label="数据表名称：" class="config-items">
            <el-input
              v-model="formData.pageName"
              size="small"
              placeholder="请输入数据表名称"
            />
          </el-form-item>
          <el-form-item label="父级数据表：" class="config-items">
            <el-input
              v-model="formData.parentId"
              size="small"
              placeholder="请输入父级数据表"
              disabled
            />
          </el-form-item>
          <el-form-item label="关联字段：" class="config-items">
            <el-select
              v-model="formData.associateField"
              size="small"
              placeholder="请选择关联字段"
              style="width: 208px"
            >
              <el-option
                v-for="item in associateFieldOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="页面路径：" class="config-items">
            <el-input
              v-model="formData.pagePath"
              size="small"
              placeholder="请输入页面路径"
            />
          </el-form-item>
        </div>

        <el-form-item label="是否开启标题：" class="config-items">
          <el-switch
            v-model="formData.showTitle"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="分页显示：" class="config-items">
          <el-switch
            v-model="formData.isPage"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="序号：" class="config-items">
          <el-switch
            v-model="formData.showIndex"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="复选框：" class="config-items">
          <el-switch
            v-model="formData.checkBox"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="高亮行：" class="config-items">
          <el-switch
            v-model="formData.light"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="显示边框：" class="config-items">
          <el-switch
            v-model="formData.showBorder"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="列合计：" class="config-items">
          <el-switch
            v-model="formData.columnTotalAlways"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="排序：" class="config-items">
          <el-switch
            v-model="formData.manualSorting"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="展示导出：" class="config-items" prop="exportbtn">
          <el-switch
            v-model="formData.exportbtn"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="主键字段：" class="config-items" prop="primaryKey">
          <el-input
            v-model="formData.primaryKey"
            placeholder="请输入"
            style="width: 150px"
            size="small"
          />
        </el-form-item>
        <el-form-item
          v-if="formData.exportbtn == 1"
          label="导出名称："
          class="config-items"
          prop="primaryKey"
        >
          <el-input
            v-model="formData.exportName"
            placeholder="请输入"
            style="width: 150px"
            size="small"
          />
        </el-form-item>
        <el-form-item label="表格类名：" class="config-items">
          <el-input
            v-model="formData.ClassName"
            placeholder="请输入"
            style="width: 150px"
            size="small"
          />
        </el-form-item>
        <el-form-item label="是否树形：" class="config-items" prop="treeModel">
          <el-switch
            v-model="formData.treeModel"
            size="small"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item
          label="树形顶级："
          class="config-items"
          prop="topColumnValue"
          v-if="formData.treeModel == '1'"
        >
          <el-input
            v-model="formData.topColumnValue"
            placeholder="请输入"
            size="small"
          />
        </el-form-item>
        <el-form-item
          label="树形父级："
          class="config-items"
          prop="parentColumn"
          v-if="formData.treeModel == '1'"
        >
          <el-input
            v-model="formData.parentColumn"
            placeholder="请输入"
            size="small"
          />
        </el-form-item>
        <el-form-item
          label="树形子级："
          class="config-items"
          prop="childColumn"
          v-if="formData.treeModel == '1'"
        >
          <el-input
            v-model="formData.childColumn"
            placeholder="请输入"
            size="small"
          />
        </el-form-item>
      </el-form>
    </div> -->

    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-line"></div>
          <h4>基本信息</h4>
        </div>
      </div>
      <el-form
        :model="formData"
        :inline="true"
        label-width="auto"
        :rules="formRules"
        class="config-form"
      >
        <div class="header-config-card">
          <div
            style="background-color: #e3eefd; border-radius: 8px; padding: 10px"
          >
            <el-form-item
              label="数据表名称："
              class="config-items"
              style="width: 99%"
            >
              <el-input
                v-model="formData.pageName"
                size="small"
                placeholder="请输入数据表名称"
              />
            </el-form-item>
            <el-form-item
              label="数据表编码："
              class="config-items"
              style="width: 99%"
            >
              <el-input
                v-model="formData.pageCode"
                size="small"
                placeholder="请输入数据表编码"
              />
            </el-form-item>
            <el-form-item
              label="父级数据表："
              class="config-items"
              style="width: 99%"
            >
              <el-input
                v-model="formData.parentId"
                size="small"
                placeholder="请输入父级数据表"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="关联字段："
              class="config-items"
              style="width: 99%"
            >
              <el-input
                :disabled="!formData.parentId"
                v-model="formData.keyWord"
                size="small"
                placeholder="请输入"
              />
            </el-form-item>
            <el-form-item
              label="页面路径："
              class="config-items"
              style="width: 99%"
              required
            >
              <el-input
                v-model="formData.pageAddr"
                size="small"
                placeholder="请输入页面路径"
              />
            </el-form-item>
            <el-form-item label="页面状态：" class="config-items">
              <el-switch
                v-model="formData.pageStatus"
                size="small"
                active-value="1"
                inactive-value="0"
              />
            </el-form-item>
          </div>

          <el-row
            :gutter="20"
            class="form-row"
            style="width: 100%; padding-right: 10px"
          >
            <el-col :span="6">
              <el-form-item label="分页显示：" class="config-items">
                <el-switch
                  v-model="formData.isPage"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="序号：" class="config-items">
                <el-switch
                  v-model="formData.showIndex"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="复选框：" class="config-items">
                <el-switch
                  v-model="formData.checkBox"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="高亮行：" class="config-items">
                <el-switch
                  v-model="formData.light"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row
            :gutter="20"
            class="form-row"
            style="width: 100%; padding-right: 10px"
          >
            <el-col :span="6">
              <el-form-item label="显示边框：" class="config-items">
                <el-switch
                  v-model="formData.showBorder"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="列合计：" class="config-items">
                <el-switch
                  v-model="formData.columnTotalAlways"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="排序：" class="config-items">
                <el-switch
                  v-model="formData.manualSorting"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="导出："
                class="config-items"
                prop="exportbtn"
              >
                <el-switch
                  v-model="formData.exportbtn"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="form-row">
            <el-col :span="8">
              <el-form-item
                label="主键字段："
                class="config-items"
                prop="primaryKey"
              >
                <el-input
                  v-model="formData.primaryKey"
                  placeholder="请输入"
                  style="width: 100%"
                  size="small"
                />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="表格类名：" class="config-items">
                <el-input
                  v-model="formData.ClassName"
                  placeholder="请输入"
                  style="width: 100%"
                  size="small"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="form-row">
            <el-col :span="8">
              <el-form-item
                label="是否树形："
                class="config-items"
                prop="treeModel"
              >
                <el-switch
                  v-model="formData.treeModel"
                  size="small"
                  active-value="1"
                  inactive-value="0"
                />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="16">
              <el-form-item label="关键词：" class="config-items">
                <el-input
                  v-model="formData.keyWord"
                  placeholder="请输入"
                  style="width: 100%"
                  size="small"
                />
              </el-form-item>
            </el-col> -->
            <el-col :span="16">
              <el-form-item
                v-if="formData.exportbtn == 1"
                label="导出名称："
                class="config-items"
                prop="primaryKey"
              >
                <el-input
                  v-model="formData.exportName"
                  placeholder="请输入"
                  style="width: 100%"
                  size="small"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="form-row">
            <el-form-item
              label="树形顶级："
              class="config-items"
              prop="topColumnValue"
              v-if="formData.treeModel == '1'"
            >
              <el-input
                v-model="formData.topColumnValue"
                placeholder="请输入"
                size="small"
              />
            </el-form-item>
            <el-form-item
              label="树形父级："
              class="config-items"
              prop="parentColumn"
              v-if="formData.treeModel == '1'"
            >
              <el-input
                v-model="formData.parentColumn"
                placeholder="请输入"
                size="small"
              />
            </el-form-item>
            <el-form-item
              label="树形子级："
              class="config-items"
              prop="childColumn"
              v-if="formData.treeModel == '1'"
            >
              <el-input
                v-model="formData.childColumn"
                placeholder="请输入"
                size="small"
              />
            </el-form-item>
          </el-row>
        </div>
      </el-form>
    </div>

    <!-- 标题样式配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-line"></div>
          <h4>标题样式配置</h4>
        </div>
      </div>
      <!-- 使用 el-form 包裹配置项 -->
      <el-form
        :model="formData"
        :inline="false"
        label-width="80px"
        class="config-form"
      >
        <div class="title-config-card">
          <!-- 主标题配置 -->
          <div class="title-group">
            <el-row :gutter="20" class="form-row">
              <el-col :span="12">
                <el-form-item label="主标题：">
                  <el-input
                    v-model="formData.title"
                    placeholder="请输入主标题"
                    size="small"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对齐方式：">
                  <el-select
                    v-model="formData.mainTitleAlign"
                    placeholder="请选择对齐方式"
                    size="small"
                    style="width: 300px"
                  >
                    <el-option label="左对齐" value="left" />
                    <el-option label="右对齐" value="right" />
                    <el-option label="居中对齐" value="center" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="form-row">
              <el-col :span="12">
                <el-form-item label="字体大小：">
                  <el-input
                    v-model="formData.titleFontSize"
                    placeholder="如：16px"
                    size="small"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="字体颜色：">
                  <el-color-picker
                    v-model="formData.titleFontColor"
                    show-alpha
                    size="small"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 副标题配置 -->
          <div class="title-group">
            <el-row :gutter="20" class="form-row">
              <el-col :span="12">
                <el-form-item label="副标题：">
                  <el-input
                    v-model="formData.subtitle"
                    placeholder="请输入副标题"
                    size="small"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对齐方式：">
                  <el-select
                    v-model="formData.subTitleAlign"
                    placeholder="请选择对齐方式"
                    size="small"
                    style="width: 300px"
                  >
                    <el-option label="左对齐" value="left" />
                    <el-option label="右对齐" value="right" />
                    <el-option label="居中对齐" value="center" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="form-row">
              <el-col :span="12">
                <el-form-item label="字体大小：">
                  <el-input
                    v-model="formData.subtitleFontSize"
                    placeholder="如：14px"
                    size="small"
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="字体颜色：">
                  <el-color-picker
                    v-model="formData.subtitleFontColor"
                    show-alpha
                    size="small"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 其他配置 -->
          <!-- <div class="title-group">
            <el-row :gutter="20" class="form-row">
              <el-col :span="12">
                <el-form-item label="连接字符：">
                  <el-input
                    v-model="formData.titleConnectChar"
                    placeholder="如：-"
                    size="small"
                    style="width: 200px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="背景颜色：">
                  <el-color-picker
                    v-model="formData.titleBgColor"
                    show-alpha
                    size="small"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div> -->
        </div>
      </el-form>
    </div>
    <!-- 表头样式配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-line"></div>
          <h4>表头样式配置</h4>
        </div>
      </div>
      <el-form
        :model="formData"
        :inline="false"
        label-width="80px"
        class="config-form"
      >
        <div class="header-config-card">
          <el-row :gutter="24" class="form-row">
            <el-col :span="12">
              <el-form-item label="表头高度：">
                <el-input
                  v-model="formData.headerHeight"
                  placeholder="如：40px"
                  size="small"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="字体大小：">
                <el-input
                  v-model="formData.headerFontSize"
                  placeholder="如：14px"
                  size="small"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24" class="form-row">
            <el-col :span="12">
              <el-form-item label="字体颜色：">
                <el-color-picker
                  v-model="formData.headerFontColor"
                  show-alpha
                  size="small"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="背景颜色：">
                <el-color-picker
                  v-model="formData.headerBgColor"
                  show-alpha
                  size="small"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <!-- 表格列配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-line"></div>
          <h4>列配置</h4>
        </div>
        <div class="column-actions">
          <el-button
            type="primary"
            size="small"
            @click="addColumns"
            class="add-btn"
          >
            <el-icon>
              <Plus />
            </el-icon>
            添加首列
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="addColumn"
            class="add-btn"
          >
            <el-icon>
              <Plus />
            </el-icon>
            添加列
          </el-button>
        </div>
      </div>

      <div
        style="
          font-size: 14px;
          font-weight: 500;
          color: #333333;
          margin-bottom: 4px;
        "
      >
        列表设置：
      </div>
      <el-form
        :model="formData"
        class="config-form"
        :inline="true"
        size="small"
      >
        <div class="header-config-card">
          <el-row :gutter="20" class="form-row">
            <el-col :span="8">
              <el-form-item label="对齐方式:">
                <el-select
                  v-model="formData.align"
                  placeholder="请选择对齐方式"
                  style="width: 200px"
                >
                  <el-option label="左对齐" value="left" />
                  <el-option label="右对齐" value="right" />
                  <el-option label="居中对齐" value="center" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="列宽:">
                <el-input
                  v-model="formData.columnWidth"
                  type="input"
                  style="width: 200px"
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div class="table-container">
        <el-table
          :data="formData.designTableColumns"
          :preserve-expanded-content="true"
          :indent="0"
          row-key="idRow"
          border
          max-height="250"
          size="small"
          class="config-table"
          @expand-change="onTreeExpandChange"
          default-expand-all
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          />
          <el-table-column label="列字段" width="150" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.columnName"
                placeholder="字段名"
                size="small"
                class="table-input"
              />
            </template>
          </el-table-column>
          <el-table-column label="列名称" width="150" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.columnLabel"
                placeholder="显示名称"
                size="small"
                class="table-input"
              />
            </template>
          </el-table-column>
          <el-table-column label="计算公式" width="100" align="center">
            <template #default="scope">
              <!-- columnFormula -->
              <Share
                style="
                  width: 2em;
                  height: 2em;
                  margin-right: 8px;
                  color: #409eff;
                  cursor: pointer;
                "
                @click="showDialog(scope.row)"
              />
              <!-- <el-input
                v-model="scope.row.columnFormula"
                placeholder="计算公式"
                size="small"
                class="table-input"
              /> -->
            </template>
          </el-table-column>
          <el-table-column label="对齐方式" width="120" align="center">
            <template #default="scope">
              <el-select
                v-model="scope.row.textAlign"
                placeholder="对齐"
                size="small"
              >
                <el-option label="左对齐" value="left" />
                <el-option label="居中" value="center" />
                <el-option label="右对齐" value="right" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="列宽" width="100" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.columnWidth"
                placeholder="宽度"
                size="small"
                class="table-input"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="formData.exportbtn == 1"
            label="行号"
            width="100"
            align="center"
          >
            <template #default="scope">
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <span style="color: #f56c6c; margin-right: 2px">*</span>
                <el-input
                  v-model="scope.row.lineNumber"
                  placeholder="行号"
                  size="small"
                  class="table-input"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="formData.exportbtn == 1"
            label="列号"
            width="100"
            align="center"
          >
            <template #default="scope">
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <span style="color: #f56c6c; margin-right: 2px">*</span>
                <el-input
                  v-model="scope.row.columnNumber"
                  placeholder="列号"
                  size="small"
                  class="table-input"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="是否为标题" width="100" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.isHeader"
                inactive-value="0"
                active-value="1"
                active-color="#ff4949"
                inactive-color="#13ce66"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="是否参与合计" width="100" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.isNeedSum"
                inactive-value="0"
                active-value="1"
                active-color="#ff4949"
                inactive-color="#13ce66"
                size="small"
              />
            </template>
          </el-table-column>

          <el-table-column
            v-if="formData.exportbtn == 1"
            label="合并列数"
            width="100"
            align="center"
          >
            <template #default="scope">
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <span style="color: #f56c6c; margin-right: 2px">*</span>
                <el-input
                  v-model="scope.row.colSpan"
                  placeholder="合并列数"
                  size="small"
                  class="table-input"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="formData.exportbtn == 1"
            label="合并行数"
            width="100"
            align="center"
          >
            <template #default="scope">
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <span style="color: #f56c6c; margin-right: 2px">*</span>
                <el-input
                  v-model="scope.row.rowSpan"
                  placeholder="合并行数"
                  size="small"
                  class="table-input"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="数据别名" width="150" align="center">
            <template #default="scope">
              <el-input
                v-model="scope.row.columnDataSourceName"
                placeholder="英文别名"
                size="small"
                class="table-input"
              />
            </template>
          </el-table-column>
          <!-- <el-table-column
            label="列合计"
            width="70"
            align="center"
            v-if="formData.columnTotalAlways == '1'"
          >
            <template #default="scope">
              <el-switch
                v-model="scope.row.columnTotal"
                active-value="1"
                inactive-value="0"
                size="small"
              />
            </template>
          </el-table-column> -->
          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <div class="action-buttons" style="gap: 0px">
                <el-button
                  link
                  size="small"
                  @click="moveUp(scope.$index, scope.row)"
                  class="action-btn"
                >
                  上移
                </el-button>
                <el-button
                  link
                  size="small"
                  @click="moveDown(scope.$index, scope.row, scope)"
                  class="action-btn"
                >
                  下移
                </el-button>
                <el-button
                  link
                  size="small"
                  @click="toggleRow(scope.row, $event)"
                  class="action-btn"
                >
                  详情
                </el-button>
                <el-button
                  link
                  size="small"
                  @click="handAdd(scope.row)"
                  class="action-btn"
                >
                  子级
                </el-button>
                <el-button
                  link
                  size="small"
                  @click="handleDel(scope.row, scope.$index)"
                  class="action-btn delete"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 动态渲染子表格 -->
        <template v-if="currentRow">
          <teleport :to="`tr.gas-add-tr .expand-content`">
            <div
              style="padding: 10px 5px; background: #f9f9f9; min-height: 60px"
            >
              <el-form
                :model="currentRow"
                size="small"
                :inline="true"
                label-width="auto"
              >
                <!-- <el-form-item label="对齐方式：" style="width: 40%">
                  <el-select
                    v-model="currentRow.textAlign"
                    placeholder="对齐"
                    clearable
                  >
                    <el-option label="左对齐" value="left" />
                    <el-option label="居中" value="center" />
                    <el-option label="右对齐" value="right" />
                  </el-select>
                </el-form-item> -->
                <!-- <el-form-item label="列宽：" style="width: 40%">
                  <el-input v-model="currentRow.columnWidth" placeholder="请输入" clearable />
                </el-form-item> -->
                <el-form-item label="类型：" style="width: 40%">
                  <el-select
                    v-model="currentRow.fieldFormat"
                    placeholder="请选择"
                    clearable
                    @change="changeFormat(currentRow)"
                  >
                    <el-option label="小数" value="number" />
                    <el-option label="文本" value="string" />
                    <el-option label="百分数" value="percent" />
                    <el-option label="千分数" value="thousandpercent" />
                    <el-option label="万分数" value="wanpercent" />
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="保留位数："
                  style="width: 40%"
                  v-if="
                    currentRow.fieldFormat == 'number' ||
                    currentRow.fieldFormat == 'percent' ||
                    currentRow.fieldFormat == 'thousandpercent' ||
                    currentRow.fieldFormat == 'wanpercent'
                  "
                >
                  <el-input
                    v-model="currentRow.digit"
                    placeholder="请输入"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="是否点击：" style="width: 40%">
                  <el-select
                    v-model="currentRow.isClick"
                    placeholder="请选择"
                    clearable
                  >
                    <el-option label="是" value="1" />
                    <el-option label="否" value="0" />
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="点击类型："
                  style="width: 40%"
                  v-if="currentRow.isClick == '1'"
                >
                  <template #label>
                    <span style="color: #f56c6c">*</span>
                    点击类型：
                  </template>
                  <el-select
                    v-model="currentRow.clickType"
                    placeholder="请选择"
                    clearable
                  >
                    <el-option label="跳转" value="1" />
                    <!-- <el-option label="抽屉" value="2" />
                    <el-option label="弹窗" value="3" /> -->
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="跳转路径："
                  style="width: 40%"
                  v-if="
                    currentRow.isClick == '1' && currentRow.clickType == '1'
                  "
                >
                  <template #label>
                    <span style="color: #f56c6c">*</span>
                    跳转路径：
                  </template>
                  <el-input
                    v-model="currentRow.jumpPath"
                    placeholder="请输入"
                    clearable
                  />
                </el-form-item>
                <el-form-item
                  label="下钻点击字段："
                  style="width: 40%"
                  v-if="
                    currentRow.isClick == '1' && currentRow.clickType == '1'
                  "
                >
                  <template #label>
                    <span style="color: #f56c6c">*</span>
                    下钻点击字段：
                  </template>
                  <el-input
                    v-model="currentRow.clickWord"
                    placeholder="请输入"
                    clearable
                  />
                </el-form-item>
                <el-form-item
                  label="下钻关键词："
                  style="width: 40%"
                  v-if="
                    currentRow.isClick == '1' && currentRow.clickType == '1'
                  "
                >
                  <template #label>
                    <span style="color: #f56c6c">*</span>
                    下钻关键词：
                  </template>
                  <el-input
                    v-model="currentRow.keyWord"
                    placeholder="请输入"
                    clearable
                  />
                </el-form-item>
                <el-form-item
                  label="抽屉组件："
                  style="width: 40%"
                  v-if="
                    currentRow.isClick == '1' && currentRow.clickType == '2'
                  "
                >
                  <el-select
                    v-model="currentRow.drawerComName"
                    placeholder="请选择"
                    clearable
                  >
                    <el-option
                      v-for="itemOpt in staffTypeOpt"
                      :label="itemOpt.label"
                      :value="itemOpt.value"
                      :key="itemOpt.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="弹窗组件："
                  style="width: 40%"
                  v-if="
                    currentRow.isClick == '1' && currentRow.clickType == '3'
                  "
                >
                  <el-select
                    v-model="currentRow.drawerComName"
                    placeholder="请选择"
                    clearable
                  >
                    <el-option
                      v-for="itemOpt in [
                        { label: '患者360', value: 'patient' },
                      ]"
                      :label="itemOpt.label"
                      :value="itemOpt.value"
                      :key="itemOpt.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间格式：" style="width: 40%">
                  <el-select
                    v-model="currentRow.dateType"
                    placeholder="请选择"
                    clearable
                  >
                    <el-option label="年" value="year" />
                    <el-option label="月" value="month" />
                    <el-option label="日" value="day" />
                    <el-option label="时" value="hour" />
                    <el-option label="分" value="minute" />
                    <el-option label="秒" value="second" />
                  </el-select>
                </el-form-item>
                <el-form-item label="固定位置：" style="width: 40%">
                  <el-select
                    v-model="currentRow.fixed"
                    placeholder="固定位置"
                    clearable
                  >
                    <el-option label="左固定" value="left" />
                    <el-option label="右固定" value="right" />
                  </el-select>
                </el-form-item>
                <el-form-item label="合计无下钻" style="width: 40%">
                  <el-switch v-model="currentRow.sumNoDrill"></el-switch>
                </el-form-item>
              </el-form>
            </div>
          </teleport>
        </template>
      </div>
    </div>
    <!-- 数据源配置 -->
    <div class="config-section">
      <div class="section-header">
        <div class="section-title">
          <div class="title-line"></div>
          <h4>数据源配置</h4>
          <span class="config-count">已配置{{ savedDsCount }}项</span>
        </div>
      </div>
      <div class="ds-config-actions">
        <el-button type="primary" @click="addDs" style="width: 300px"
          >数据源配置</el-button
        >
      </div>
      <!-- <el-form :model="formData" class="config-form"> -->
      <!-- <el-form-item label="查询接口：" class="config-item full-width">
          <el-input v-model="formData.apiUrl" placeholder="请输入" class="code-input full-width" />
        </el-form-item> -->
      <!-- <el-form-item label="数据来源：" class="config-item full-width">
          <el-select
            v-model="formData.dsType"
            placeholder="请选择数据来源"
            class="full-width"
          >
            <el-option label="SQL查询" value="SQL" />
            <el-option label="API接口" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="`${formData.dsType === 'API' ? '接口路径：' : '查询语句：'}`"
          class="config-item full-width"
        >
          <el-input
            v-model="formData.dsConfig"
            type="textarea"
            :rows="4"
            placeholder="请输入SQL查询语句或API配置"
            class="code-input full-width"
          >
          </el-input>
        </el-form-item>
        <el-button
          @click="cereteCode()"
          type="primary"
          size="small"
          class="add-btn"
          v-if="formData.dsType == 'SQL'"
          >解析SQL</el-button
        >
      </el-form> -->
    </div>
    <!-- 操作按钮 -->
    <div class="action-section">
      <el-button type="primary" @click="onSubmit" class="save-btn">
        <el-icon>
          <Check />
        </el-icon>
        保存配置
      </el-button>
      <el-button @click="resetForm" class="reset-btn">
        <el-icon>
          <Refresh />
        </el-icon>
        重置
      </el-button>
    </div>
    <el-dialog
      style="padding-bottom: 20px"
      v-model="columnFormulaDia"
      title="计算表达式"
      width="500"
    >
      <div>
        <!-- <span>列字段：</span>
        <el-select
          v-model="columnName"
          placeholder="请选择执行类型"
          size="small"
          multiple
          clearable
          style="width: 150px"
          @change="handleScriptColumnSelect"
        > -->
        <!-- <el-select
          v-model="columnNameList"
          placeholder="请选择执行类型"
          size="small"
          multiple
          clearable
          style="width: 150px"
        > -->
        <!-- <el-option
            v-for="item in flattenedColumns"
            :key="item.idRow"
            :label="item.columnLabel"
            :value="item.idRow"
          />
        </el-select> -->

        <Editor
          :id="Date.now()"
          v-model:value="scriptInfo"
          style="margin-top: 10px"
        ></Editor>
      </div>
      <template #footer>
        <div
          class="dialog-footer"
          style="text-align: center; margin-bottom: 20px"
        >
          <el-button @click="cancelSave">取消</el-button>
          <el-button type="primary" @click="saveColumnFormula">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 数据源配置对话框 -->
    <el-dialog
      v-model="dsConfigDialogVisible"
      title="数据源配置"
      width="90%"
      destroy-on-close
    >
      <template #header>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          "
        >
          <span>数据源配置</span>
          <el-button
            type="primary"
            @click="addDsConfig"
            style="margin-right: 20px"
            >新增项</el-button
          >
        </div>
      </template>
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item
          v-for="(ds, index) in dsConfigs"
          :key="index"
          :title="`数据源 ${index + 1}`"
          :name="ds.id"
          class="ds-config-item"
        >
          <template #title>
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
              "
            >
              <span>数据源 {{ index + 1 }}</span>
              <el-button
                type="danger"
                size="small"
                @click.stop="removeDs(index)"
              >
                删除
              </el-button>
            </div>
          </template>
          <div style="display: flex; align-items: flex-start; flex-wrap: wrap">
            <el-form-item
              label="所属数据源："
              label-width="85px"
              style="margin: 0; flex: 1"
            >
              <el-select
                v-model="ds.dataSourceType"
                placeholder="请选择所属数据源"
                size="small"
                style="width: 150px"
              >
                <el-option
                  v-for="item in dataSourceList"
                  :key="item.datasourceid"
                  :label="item.databaseName"
                  :value="item.datasourceid"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="执行类型："
              label-width="85px"
              style="margin: 0; flex: 1"
            >
              <el-select
                v-model="ds.dsType"
                placeholder="请选择执行类型"
                size="small"
                style="width: 150px"
              >
                <el-option label="SQL查询" value="SQL" />
                <el-option label="API接口" value="API" />
              </el-select>
            </el-form-item>
            <el-form-item
              label="列字段："
              label-width="85px"
              multiple
              clearable
              style="margin: 0; flex: 1"
            >
              <!-- <el-select
                v-model="ds.columnName"
                placeholder="请选择执行类型"
                size="small"
                multiple
                clearable
                style="width: 150px"
                @change="(value) => handleColumnSelect(value, ds)"
              > -->
              <el-select
                v-model="ds.columnName"
                placeholder="请选择执行类型"
                size="small"
                multiple
                clearable
                style="width: 150px"
              >
                <el-option
                  v-for="item in flattenedColumns"
                  :key="item.idRow"
                  :label="item.columnLabel"
                  :value="item.idRow"
                />
              </el-select>
            </el-form-item>
            <!-- <el-form-item
              label="是否启用："
              label-width="85px"
              style="margin: 0; flex: 0 0 auto"
            >
              <el-switch
                v-model="ds.enabled"
                active-value="1"
                size="small"
                inactive-value="0"
              />
            </el-form-item> -->
          </div>
          <el-form-item label="查询语句：" style="margin: 0" label-width="85px">
            <el-input
              v-model="ds.queryStatement"
              type="textarea"
              :rows="3"
              placeholder="请输入查询语句"
              style="width: 100%; background-color: #f5f7fa"
            ></el-input>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
      <template #footer>
        <div
          style="
            display: flex;
            justify-content: center;
            width: 100%;
            height: 35px;
          "
        >
          <el-button @click="cancelDsConfig">取消</el-button>
          <el-button type="primary" @click="saveDsConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  watch,
  nextTick,
  defineAsyncComponent,
  computed,
  defineExpose,
} from "vue";
import { parseColumns } from "@/api/tool.js";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
const Editor = defineAsyncComponent(() => import("./Editor.vue"));
const columnNameList = ref("");
// 定义事件
const emit = defineEmits(["update"]);
const route = useRoute();
// 定义props
const props = defineProps({
  component: {
    type: Object,
    required: true,
  },
  currentTreeNode: {
    type: Object,
    default: null,
  },
});
const scriptInfo = ref("");
const flattenedColumns = computed(() => {
  const flatten = (columns) => {
    return columns.reduce((result, column) => {
      result.push(column);
      if (column.children && column.children.length > 0) {
        result.push(...flatten(column.children));
      }
      return result;
    }, []);
  };
  return flatten(formData.value.designTableColumns);
});
const dataSourceList = ref([]);
// 表单数据
const formData = ref({
  pageStatus: "0",
  align: "", //  表格对齐方式
  isPage: "0", //  是否需要分页
  ClassName: "", //  表格样式
  showIndex: "", //  是否显示序号列
  checkBox: "", //  是否显示复选框列
  primaryKey: "ASSIGN_KEY", //  行唯一标识字段名
  light: "", //  高亮行
  showBorder: "", //  是否展示边框
  designTableColumns: [], //  表格数据
  sqltextarea: "", //  sql
  datasourceId: "", //  数据源id
  dsType: "", //  来源方式
  dsConfig: "", //  来源配置
  exportbtn: "", // 展示导出按钮
  apiUrl: "/business/design-data/queryDataPage", //  接口地址
  treeModel: "0", //  是否树形结构
  topColumnValue: "", //  顶级列名
  parentColumn: "", //  父级列名
  childColumn: "", //  子级列名
  rowClickData: "", // 0无 1 排行 ， 2 事件
  headerHeight: "36px", // 表头高度默认36px
  headerBgColor: "#5380fd", // 表头背景颜色默认#5380fd
  headerFontSize: "16px", // 表头字体大小默认16px
  headerFontColor: "#ffffff", // 表头字体颜色默认白色
  columnTotalAlways: "0", // 是否开启合计功能
  manualSorting: "0", // 是否开启手动排序
  // 标题配置
  // showTitle: "0", // 是否开启标题
  title: "", // 主标题内容
  titleBgColor: "", // 标题背景颜色
  titleFontSize: "20px", // 主标题字体大小
  titleFontColor: "", // 主标题字体颜色
  subtitle: "", // 副标题内容
  subtitleFontSize: "18px", // 副标题字体大小
  subtitleFontColor: "", // 副标题字体颜色
  titleConnectChar: "-", // 主副标题连接字符
  //keyWord: "", // 关键词
});
// 关联字段选项
const associateFieldOptions = ref([]);
const currentRow = ref(null);
const scriptInfoRow = ref(null);
const columnFormulaDia = ref(false);

// 点击打开对话框
const showDialog = (row) => {
  console.log("row", row);
  columnFormulaDia.value = true;
  scriptInfoRow.value = row; // 保存当前行引用
  scriptInfo.value = row.columnFormula || "";
};

// 保存计算表达式
const saveColumnFormula = () => {
  if (scriptInfoRow.value) {
    scriptInfoRow.value.columnFormula = scriptInfo.value;
    scriptInfoRow.value.columnNameList = columnNameList.value;
  }
  columnFormulaDia.value = false;
  ElMessage.success("计算表达式已保存");
  // emit("update", formData.value);
};

// 取消保存
const cancelSave = () => {
  columnFormulaDia.value = false;
};

// 表单校验规则
const formRules = reactive({
  primaryKey: [
    { required: true, message: "请输入主键字段名", trigger: "blur" },
    {
      pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      message: "主键字段名只能包含字母、数字和下划线，且不能以数字开头",
      trigger: "blur",
    },
    { max: 50, message: "主键字段名长度不能超过50个字符", trigger: "blur" },
  ],
  treeModel: [
    {
      type: "string",
      required: true,
      message: "请选择是否树形结构",
      trigger: "change",
    },
  ],
  topColumnValue: [
    {
      required: () => formData.treeModel === "1",
      message: "请输入顶级列名",
      trigger: ["blur", "change"],
    },
    {
      max: 50,
      message: "顶级列名长度不能超过50个字符",
      trigger: "blur",
      required: false,
    },
  ],
  parentColumn: [
    {
      required: () => formData.treeModel === "1",
      message: "请输入父级列名",
      trigger: ["blur", "change"],
    },
    {
      max: 50,
      message: "父级列名长度不能超过50个字符",
      trigger: "blur",
      required: false,
    },
  ],
  childColumn: [
    {
      required: () => formData.treeModel === "1",
      message: "请输入子级列名",
      trigger: ["blur", "change"],
    },
    {
      max: 50,
      message: "子级列名长度不能超过50个字符",
      trigger: "blur",
      required: false,
    },
  ],
});

// 数据源配置对话框
const dsConfigDialogVisible = ref(false);
// 数据源配置数据
const dsConfigs = ref([]);
// 折叠面板激活状态
const activeNames = ref([]);

// 打开数据源配置对话框
const addDs = () => {
  // 如果 formData.dsConfig 中有数据，先恢复到 dsConfigs 中
  if (formData.value.dsConfig) {
    try {
      dsConfigs.value = JSON.parse(formData.value.dsConfig);
    } catch (error) {
      console.error("Error parsing dsConfig data when opening dialog:", error);
      dsConfigs.value = [];
    }
  } else {
    dsConfigs.value = [];
  }
  dsConfigDialogVisible.value = true;
};

// 添加数据源配置项
const addDsConfig = () => {
  dsConfigs.value.push({
    id: Date.now(),
    dataSourceType: "",
    enabled: "1",
    queryStatement: "",
  });
};

// 删除数据源配置项
const removeDs = (index) => {
  dsConfigs.value.splice(index, 1);
};

// 保存数据源配置
const saveDsConfig = () => {
  // 这里可以添加保存逻辑，例如更新到formData中
  formData.value.dsConfig = JSON.stringify(dsConfigs.value);
  dsConfigDialogVisible.value = false;
  ElMessage.success("数据源配置已保存");
  //  emit("update", formData.value);
};

// 计算已保存的数据源配置数量
const savedDsCount = computed(() => {
  if (formData.value.dsConfig) {
    try {
      const configs = JSON.parse(formData.value.dsConfig);
      return configs.length;
    } catch (error) {
      console.error("Error parsing saved dsConfig data:", error);
      return 0;
    }
  }
  return 0;
});

// 取消数据源配置
const cancelDsConfig = () => {
  dsConfigDialogVisible.value = false;
};

// 处理列字段选择
const handleColumnSelect = (value, ds) => {
  // 如果查询语句为空，直接赋值
  if (!ds.queryStatement) {
    ds.queryStatement = value;
  } else {
    // 否则追加到查询语句中
    ds.queryStatement += ` ${value}`;
  }
};
const staffTypeOpt = ref([
  { label: "人员详情", value: "personnelInformation" },
  //{ label: "人员详情", value: 'personnelInformation' },
  // { label: "护士", value: "1", type: 'personnelInformation' },
  // { label: "技师", value: "2", type: 'personnelInformation' },
]);

const changeFormat = (val) => {
  currentRow.value.digit = "";
};

// 处理脚本列字段选择
const handleScriptColumnSelect = (value) => {
  // 如果scriptInfo为空，直接赋值
  if (!scriptInfo.value) {
    scriptInfo.value = value;
  } else {
    // 否则追加到scriptInfo中
    scriptInfo.value += ` ${value}`;
  }
};

const cereteCode = async () => {
  if (formData.value.dsConfig != "") {
    let res = await parseColumns({ bash: formData.value.dsConfig });
    formData.value.designTableColumns = res.map((item) => {
      return {
        columnName: item.columnName,
        columnDataSourceName: "",
        columnLabel: item.columnLabel,
        textAlign: "left",
        columnWidth: "",
        columnTotal: "0",
        isHeader: "0",
        isNeedSum: "1",
        children: item.children ? item.children : [],
        idRow: generateRandomId(),
      };
    });
  } else {
    ElMessage.warning("请输入SQL");
  }
};
// 随机生成ID
const generateRandomId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 删除指定对象
function removeNodeByIdRow(tree, idRow, childrenKey = "children") {
  // 过滤掉根节点中匹配的节点
  const filteredTree = tree.filter((node) => node.idRow !== idRow);
  // 递归处理子节点
  filteredTree.forEach((node) => {
    if (node[childrenKey] && node[childrenKey].length > 0) {
      node[childrenKey] = removeNodeByIdRow(
        node[childrenKey],
        idRow,
        childrenKey,
      );
    }
  });

  return filteredTree;
}

const rowClickDataOptions = ref([
  { value: "0", label: "无" },
  { value: "1", label: "图表科室排序" },
  { value: "2", label: "图表科室" },
]);

// 添加列
const addColumn = () => {
  formData.value.designTableColumns.push({
    columnName: "",
    columnDataSourceName: "",
    columnLabel: "",
    textAlign: "left",
    columnWidth: "",
    columnTotal: "0",
    columnFormula: "", // 添加计算表达式字段
    children: [],
    idRow: generateRandomId(),
    isHeader: "0",
    isNeedSum: "1",
  });
  // 重新计算行号和列号
  recalculateRowAndColumnNumbers();
};

// 添加列
const addColumns = () => {
  formData.value.designTableColumns.unshift({
    columnName: "",
    columnDataSourceName: "",
    columnLabel: "",
    textAlign: "left",
    columnWidth: "",
    columnTotal: "0",
    children: [],
    idRow: generateRandomId(),
    isHeader: "0",
    isNeedSum: "1",
  });
  // 重新计算行号和列号
  recalculateRowAndColumnNumbers();
};
// 添加子级
const handAdd = (row) => {
  if (row.children) {
    row.children.push({
      columnName: "",
      columnLabel: "",
      columnWidth: "",
      columnTotal: "0",
      idRow: generateRandomId(),
      isHeader: "0",
      isNeedSum: "1",
      parentColumnId: row.idRow, //父列ID
      columnId: generateRandomId(), //子列ID
    });
  } else {
    row.children = [
      {
        columnName: "",
        columnLabel: "",
        textAlign: "left",
        columnWidth: "",
        columnTotal: "0",
        idRow: generateRandomId(),
        isHeader: "0",
        isNeedSum: "1",
        parentColumnId: row.idRow, //父列ID
        columnId: generateRandomId(), //子列ID
      },
    ];
  }
  // 重新计算行号和列号
  recalculateRowAndColumnNumbers();
};

// 重新计算所有行的行号和列号
const recalculateRowAndColumnNumbers = () => {
  const columns = formData.value.designTableColumns;

  // 递归计算行号、列号、合并列数和合并行数
  const calculateNumbers = (items, rowNum = 0, colNum = 0) => {
    items.forEach((item, index) => {
      // 设置行号和列号
      item.lineNumber = rowNum.toString();
      item.columnNumber = (colNum + index).toString();

      // 计算合并列数：如果有子列，合并列数为子列数量，否则为1
      item.colSpan =
        item.children && item.children.length > 0
          ? item.children.length.toString()
          : "1";

      // 计算合并行数：如果有子列，合并行数为1（子列会占一行），否则为1
      item.rowSpan = "1";

      // 递归处理子列
      if (item.children && item.children.length > 0) {
        calculateNumbers(item.children, rowNum + 1, colNum);
      }
    });
  };

  calculateNumbers(columns);
};

// 删除行操作
const handleDel = (row) => {
  formData.value.designTableColumns = removeNodeByIdRow(
    formData.value.designTableColumns,
    row.idRow,
  );
  // 重新计算行号和列号
  recalculateRowAndColumnNumbers();
};

// 重置表单
const resetForm = () => {
  if (props.component && props.component.bind) {
    try {
      const bindData = JSON.parse(JSON.stringify(props.component.bind));
      // 确保数据类型正确
      formData.value = formDataFn("", bindData);
      // 从 formData.dsConfig 恢复 dsConfigs 数据
      if (formData.value.dsConfig) {
        try {
          dsConfigs.value = JSON.parse(formData.value.dsConfig);
        } catch (error) {
          console.error(
            "Error parsing dsConfig data when resetting form:",
            error,
          );
          dsConfigs.value = [];
        }
      } else {
        dsConfigs.value = [];
      }
    } catch (error) {
      console.error("Error resetting form data:", error);
    }
  }
};
// 根据 idRow 在同层级中移动元素
const moveItemInSameLevel = (treeData, idRow, direction) => {
  const findAndMove = (nodes, targetIdRow, moveDirection) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // 找到目标节点
      if (node.idRow === targetIdRow) {
        // 向上移动
        if (moveDirection === "up" && i > 0) {
          [nodes[i - 1], nodes[i]] = [nodes[i], nodes[i - 1]];
          return true;
        }
        // 向下移动
        else if (moveDirection === "down" && i < nodes.length - 1) {
          [nodes[i], nodes[i + 1]] = [nodes[i + 1], nodes[i]];
          return true;
        }
        return false;
      }

      // 递归查找子节点
      if (node.children && node.children.length > 0) {
        if (findAndMove(node.children, targetIdRow, moveDirection)) {
          return true;
        }
      }
    }
    return false;
  };

  findAndMove(treeData, idRow, direction);
  return treeData;
};
// 上移
const moveUp = (index, row) => {
  moveItemInSameLevel(formData.value.designTableColumns, row.idRow, "up");
};

// 下移
const moveDown = (index, row, scope) => {
  moveItemInSameLevel(formData.value.designTableColumns, row.idRow, "down");
};

// 处理formData
const formDataFn = (type, bindData) => {
  if (type == "空") {
    return {
      ...bindData,
      tabIndex: "",
      rowClickData: "",
      isPage: "0",
      ClassName: "",
      showIndex: "1",
      checkBox: "0",
      primaryKey: "id",
      light: "0",
      showBorder: "0",
      designTableColumns: [],
      sqltextarea: "",
      datasourceId: "",
      dsType: "",
      dsConfig: "",
      // apiUrl: '',
      exportbtn: "0",
      treeModel: "0",
      topColumnValue: "",
      parentColumn: "",
      childColumn: "",
      headerHeight: "36px", // 默认表头高度
      headerBgColor: "#5380fd", // 默认表头背景颜色
      headerFontSize: "16px", // 默认表头字体大小
      headerFontColor: "#ffffff", // 默认表头字体颜色
      columnTotalAlways: "0", // 是否开启合计功能
      manualSorting: "0", // 是否开启手动排序
      // 标题配置默认值
      //  showTitle: "0",
      title: "",
      titleBgColor: "",
      titleFontSize: "20px",
      titleFontColor: "",
      subtitle: "",
      subtitleFontSize: "18px",
      subtitleFontColor: "",
      titleConnectChar: "-",
    };
  } else {
    console.log(
      " bindData.designTableColumns",
      bindData.designTableColumns,
      bindData,
    );
    return {
      ...bindData,
      tabIndex: bindData.tabIndex,
      isPage: bindData.isPage,
      ClassName: bindData.ClassName,
      showIndex: bindData.showIndex,
      checkBox: bindData.checkBox,
      primaryKey: bindData.primaryKey || "id",
      light: bindData.light,
      rowClickData: bindData.rowClickData,
      showBorder: bindData.showBorder,
      designTableColumns: bindData.designTableColumns || [],
      sqltextarea: bindData.sqltextarea || "",
      datasourceId: bindData.datasourceId || "",
      dsType: bindData.dsType || "",
      dsConfig: bindData.dsConfig || "",
      // apiUrl: bindData.apiUrl || '',
      exportbtn: bindData.exportbtn || "0",
      treeModel: bindData.treeModel || "0",
      topColumnValue: bindData.topColumnValue || "",
      parentColumn: bindData.parentColumn || "",
      childColumn: bindData.childColumn || "",
      headerHeight: bindData.headerHeight || "40px",
      headerBgColor: bindData.headerBgColor || "#5380fd",
      headerFontSize: bindData.headerFontSize || "16px",
      headerFontColor: bindData.headerFontColor || "#ffffff",
      columnTotalAlways: bindData.columnTotalAlways || "0", // 是否开启合计功能
      manualSorting: bindData.manualSorting || "0", // 是否开启手动排序
      // 标题配置默认值
      //  showTitle: bindData.showTitle || "0",
      title: bindData.title || "",
      titleBgColor: bindData.titleBgColor || "",
      titleFontSize: bindData.titleFontSize || "",
      titleFontColor: bindData.titleFontColor || "",
      subtitle: bindData.subtitle || "",
      subtitleFontSize: bindData.subtitleFontSize || "",
      subtitleFontColor: bindData.subtitleFontColor || "",
      titleConnectChar: bindData.titleConnectChar || "-",
    };
  }
};

// 树形结合展开
const toggleRow = (row, event) => {
  const idRow = row.idRow;
  const rowElement = event.target.closest("tr");
  if (rowElement && rowElement.closest("table")) {
    const rowsToRemove = rowElement
      .closest("table")
      .querySelectorAll("tr.gas-add-tr");
    rowsToRemove.forEach((row) => row.remove());
  }
  if (currentRow.value && currentRow.value.idRow == idRow) {
    // 如果已经存在，关闭它
    currentRow.value = null;
  } else {
    currentRow.value = null;

    nextTick(() => {
      currentRow.value = row;
      const newRow = document.createElement("tr");
      newRow.classList.add("gas-add-tr");

      const newRowContent = document.createElement("td");
      newRowContent.colSpan = "12";
      newRowContent.innerHTML = `
        <div class="expand-content">
          <!-- 子表格渲染区域 -->
        </div>
      `;
      newRow.appendChild(newRowContent);
      rowElement.parentNode.insertBefore(newRow, rowElement.nextSibling);
    });
  }
};

// 监听组件变化，更新表单数据
watch(
  () => props.component,
  (newComponent) => {
    console.log(newComponent.bind, "newComponent0000000000000000000000000000");
    let savedDsConfigs = null;
    if (newComponent.dataSourceEntity) {
      dataSourceList.value = newComponent.dataSourceEntity;
    }
    if (newComponent.bind.projectId && route.query.pageId) {
      dataSourceList.value =
        newComponent.currentTreeNode?.dataSourceEntity ||
        newComponent.bind.dataSourceEntity;
    }
    if (
      route.query.pageId &&
      newComponent.bind.projectId &&
      newComponent.currentTreeNode.scriptInfo &&
      newComponent.currentTreeNode.scriptInfo.length > 0
    ) {
      dsConfigs.value = [];
      newComponent.currentTreeNode.scriptInfo.forEach((item) => {
        dsConfigs.value.push({
          id: Date.now() + Math.random(),
          dataSourceType: item.scriptDatasourceUuid,
          dsType: item.scriptType,
          queryStatement: item.scriptText,
          columnName: item.columnInfo,
          enabled: "1",
        });
      });
      console.log(dsConfigs.value, "dsConfigs.value8888888888888888");
      // 保存dsConfigs数据
      savedDsConfigs = JSON.stringify(dsConfigs.value);
    }
    if (newComponent && newComponent.bind) {
      try {
        console.log(
          newComponent,
          "newComponent55555555555555555555555555555555555555555",
        );
        const bindData = JSON.parse(JSON.stringify(newComponent.bind));
        bindData.id =
          (newComponent.currentTreeNode && newComponent.currentTreeNode.id) ||
          newComponent.bind.id;
        if (newComponent.currentTreeNode) {
          nextTick(() => {
            console.log(
              newComponent.currentTreeNode,
              "bindData111111111111111111",
            );
            formData.value.pageName =
              newComponent.currentTreeNode.pageName || "";
            formData.value.pageCode =
              newComponent.currentTreeNode.pageCode || "";
            formData.value.parentId =
              newComponent.currentTreeNode.pageLabel ||
              newComponent.bind.parentId ||
              "";
            formData.value.keyWord = newComponent.currentTreeNode.keyWord || "";
            formData.value.projectId =
              newComponent.currentTreeNode.projectId || "";
            formData.value.pageAddr =
              newComponent.currentTreeNode.pageAddr || "";
          });
        }
        // 确保数据类型正确
        formData.value = formDataFn("", bindData);
        // 恢复之前保存的dsConfigs数据
        if (savedDsConfigs) {
          try {
            dsConfigs.value = JSON.parse(savedDsConfigs);
            formData.value.dsConfig = savedDsConfigs;
          } catch (error) {
            console.error("Error parsing saved dsConfig data:", error);
            dsConfigs.value = [];
          }
        } else if (formData.value.dsConfig) {
          try {
            dsConfigs.value = JSON.parse(formData.value.dsConfig);
          } catch (error) {
            console.error("Error parsing dsConfig data:", error);
            dsConfigs.value = [];
          }
        } else {
          dsConfigs.value = [];
        }
        // 重新计算行号和列号
        recalculateRowAndColumnNumbers();
      } catch (error) {
        console.error("Error parsing component bind data:", error);
        // 使用默认值
        formData.value = formDataFn("空");
        dsConfigs.value = [];
        // 重新计算行号和列号
        recalculateRowAndColumnNumbers();
      }
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => formData.value.treeModel,
  (newVal) => {
    if (newVal === "1") {
      // 当树形结构开启时，设置默认值
      if (!formData.value.topColumnValue) {
        formData.value.topColumnValue = "0";
      }
      if (!formData.value.parentColumn) {
        formData.value.parentColumn = "HOSPITAL_FATHER_CODE";
      }
      if (!formData.value.childColumn) {
        formData.value.childColumn = "H_DPT_CODE";
      }
    }
  },
  { immediate: true },
);

// 提交表单
// 递归检查所有列的点击类型相关字段
const checkClickTypeFields = (columns) => {
  for (const column of columns) {
    console.log(column, "column");
    // 检查当前列
    if (column.isClick == "1") {
      if (!column.clickType) {
        ElMessage.warning(
          `列 "${column.columnLabel || column.columnName}" 的点击类型必填`,
        );
        return false;
      }
      if (!column.jumpPath || column.jumpPath.trim() === "") {
        ElMessage.warning(
          `列 "${column.columnLabel || column.columnName}" 的跳转路径必填`,
        );
        return false;
      }
      if (!column.clickWord || column.clickWord.trim() === "") {
        ElMessage.warning(
          `列 "${column.columnLabel || column.columnName}" 的下钻点击字段必填`,
        );
        return false;
      }
      if (!column.keyWord || column.keyWord.trim() === "") {
        ElMessage.warning(
          `列 "${column.columnLabel || column.columnName}" 的下钻关键词必填`,
        );
        return false;
      }
    }
    // 递归检查子列
    if (column.children && column.children.length > 0) {
      if (!checkClickTypeFields(column.children)) {
        return false;
      }
    }
  }
  return true;
};

// 递归检查所有列的导出相关字段
const checkExportFields = (columns) => {
  for (const column of columns) {
    // 检查当前列
    if (!column.lineNumber) {
      ElMessage.warning(
        `列 "${column.columnLabel || column.columnName}" 的行号必填`,
      );
      return false;
    }
    if (!column.columnNumber) {
      ElMessage.warning(
        `列 "${column.columnLabel || column.columnName}" 的列号必填`,
      );
      return false;
    }
    if (!column.colSpan) {
      ElMessage.warning(
        `列 "${column.columnLabel || column.columnName}" 的合并列数必填`,
      );
      return false;
    }
    if (!column.rowSpan) {
      ElMessage.warning(
        `列 "${column.columnLabel || column.columnName}" 的合并行数必填`,
      );
      return false;
    }
    // 递归检查子列
    if (column.children && column.children.length > 0) {
      if (!checkExportFields(column.children)) {
        return false;
      }
    }
  }
  return true;
};

const onSubmit = () => {
  // 验证页面路径
  if (!formData.value.pageAddr || formData.value.pageAddr.trim() === "") {
    ElMessage.warning("请填写页面路径");
    return;
  }

  // 验证点击类型相关字段
  if (!checkClickTypeFields(formData.value.designTableColumns)) {
    return;
  }

  // 验证导出相关字段
  if (formData.value.exportbtn === "1") {
    if (!checkExportFields(formData.value.designTableColumns)) {
      return;
    }
  }

  // 确保dsConfigs数组被同步到formData中
  formData.value.dsConfig = JSON.stringify(dsConfigs.value);
  // 触发父组件更新
  emit("update", {
    idComponent: props.component.uuidC,
    formData: formData.value,
    currentIndex: props.current,
  });
};

// 判断 row 是否是 currentRow 或其祖先
function isRowOrAncestor(row, targetRow) {
  if (!row || !targetRow) return false;
  if (row.idRow === targetRow.idRow) return true;
  if (row.children && row.children.length) {
    return row.children.some((child) => isRowOrAncestor(child, targetRow));
  }
  return false;
}

// el-table 树节点展开/收起事件
const onTreeExpandChange = (row, expanded) => {
  // expanded: true=展开，false=收起
  if (currentRow.value) {
    console.log(11);
    // 如果 currentRow 是被收起的 row 或其子节点，则关闭详情
    currentRow.value = null;
    // 移除 DOM 插入的 tr
    nextTick(() => {
      const rowsToRemove = document.querySelectorAll("tr.gas-add-tr");
      rowsToRemove.forEach((row) => row.remove());
    });
  }
};
defineExpose({
  saveDsConfig,
});
</script>

<style scoped>
::v-deep .el-form-item__label {
  font-size: 12px !important;
}
.el-form-item {
  margin: 0px !important;
  padding: 0px !important;
}
.table-config-panel {
  padding: 0;
  height: 100%;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
}

.config-section {
  margin: 10px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* margin-bottom: 20px; */
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
  padding-bottom: 10px;
}

.section-header h4 {
  margin: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.add-btn {
  border-radius: 6px;
  font-size: 13px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.code-input {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
}

.table-container {
  margin-top: 10px;
}

.config-table {
  border-radius: 6px;
  overflow: hidden;
}

.table-input {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  padding: 4px 0px;
  font-size: 12px;
}

.action-btn.delete {
  color: #dc3545;
}

.action-btn.delete:hover {
  color: #c82333;
}

.action-section {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 6px 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
  justify-content: center;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 11;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }

  .config-section {
    margin: 12px;
    padding: 16px;
  }

  .action-section {
    padding: 12px;
  }
}

/* 滚动条样式 */
.table-config-panel::-webkit-scrollbar {
  width: 6px;
}

.table-config-panel::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 3px;
}

.table-config-panel::-webkit-scrollbar-thumb {
  background: #c1c3c4;
  border-radius: 3px;
}

.table-config-panel::-webkit-scrollbar-thumb:hover {
  background: #a8aaab;
}
</style>

<style lang="less">
.config-table {
  width: 100%;
  .el-table__expand-icon {
    width: 18px !important;
    height: 18px !important;

    .el-icon {
      font-size: 18px !important;
    }
  }

  // 为不同层级定义样式
  .level-style(@level) {
    .el-table__row--level-@{level} {
      .el-table__cell:nth-child(2) {
        .table-input {
          margin-left: (@level * 5px) !important;
          width: calc(100% - (@level * 5px)) !important;
        }
      }
    }
  }

  // 生成1-10级的样式
  .level-style(1);
  .level-style(2);
  .level-style(3);
  .level-style(4);
  .level-style(5);
  .level-style(6);
  .level-style(7);
  .level-style(8);
  .level-style(9);
  .level-style(10);
}

.section-title {
  display: flex;
  align-items: center;
}

.title-line {
  width: 3px;
  height: 18px;
  background-color: #276efd;
  margin-right: 8px;
}

.title-line.small {
  height: 14px;
}

.section-title h4 {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
}

.config-count {
  font-size: 14px;
  color: #305af6;
  font-weight: 600;
  margin-left: 12px;
}

.ds-config-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.column-actions {
  display: flex;
  gap: 12px;
}

.config-form {
  width: 100%;
}

.form-row {
  margin: 2px 0;
}

.title-config-card,
.header-config-card {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
}

.title-group {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.title-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.save-btn,
.reset-btn {
  min-width: 120px;
  padding: 8px 20px;
  border-radius: 4px;
}
</style>
