<!-- 封装可复用的上传组件 -->
<template>
  <div class="contentBox">
    <el-upload
      :style="{
        cursor: elformDisabled ? 'default' : 'pointer',
        backgroundColor: fileUrl ? '#fff' : 'rgba(0, 115, 237, 0.1)',
        border: fileUrl ? '4px solid rgba(230, 227, 227, 1)' : '',
      }"
      class="avatar-uploader hover-show"
      action="/api/specialty-evaluation/upload"
      :show-file-list="false"
      :on-success="handleUploadSuccess"
      :headers="headers"
      :before-upload="beforeAvatarUpload"
      accept=".jpg,.png,.jpeg,.gif"
      :disabled="elformDisabled"
    >
      <template #trigger>
        <div
          v-if="!fileUrl && !elformDisabled"
          class="upload-icon"
          @mouseenter="isHover = true"
          @mouseleave="isHover = false"
        >
          <!-- <img src="@/assets/ItemImg/uploadHover.png" class="uploadImg" style="width: 60px;" v-if="isHover">
                    <img src="@/assets/ItemImg/upload.png" class="uploadImg" style="width: 60px;" v-else> -->
          <img src="@/assets/ItemImg/jgsc.svg" style="margin-right: 5px" />
          <span class="uploadText">点击上传</span>
        </div>
        <div v-if="!fileUrl && elformDisabled">
          <p style="text-align: center; color: rgba(0, 115, 237, 1)">未上传</p>
        </div>
      </template>
      <div v-if="fileUrl" class="image-preview">
        <img :src="fileUrl" class="imgBox" />
        <!-- <div class="mask-layer">
          <div @click.stop="viewFile(fileUrl)" style="display: flex; align-items: center; margin-right: 30px;cursor: pointer;" v-if="elformDisabled">
            <span style="font-size: 14px; color: #FFFFFF; line-height: 1;">查看</span>
          </div>
          <div @click.stop="downFile(fileUrl)" style="display: flex; align-items: center;cursor: pointer;" v-if="elformDisabled">
            <span style="font-size: 14px; color: #FFFFFF; line-height: 1;">下载</span>
          </div>
          <div @mouseenter="delHover = true" @mouseleave="delHover = false">
            <img @click.stop="handleRemove" v-if="!elformDisabled && delHover" src="@/assets/ItemImg/DeleteHover.png" style="width: 20px; height: 20px; margin-right: 5px;cursor: pointer;" />
            <img @click.stop="handleRemove" v-if="!elformDisabled && !delHover" src="@/assets/ItemImg/delete.png" style="width: 20px; height: 20px; margin-right: 5px;cursor: pointer;" />
          </div>
        </div> -->
      </div>
      <div class="handle-icon-class" v-if="fileUrl">
        <div class="icon-text-class" v-if="!elformDisabled" @click="handleUpload">
          <img src="@/assets/ItemImg/jgsc.svg" style="margin-right: 5px" />
          <div class="handleText">上传</div>
        </div>
        <div class="icon-text-class" @click.stop="downFile(fileUrl)">
          <img src="@/assets/ItemImg/jgxz.svg" style="margin-right: 5px" />
          <div class="handleText">下载</div>
        </div>
        <div class="icon-text-class" @click.stop="viewFile(fileUrl)">
          <img src="@/assets/ItemImg/jgck.svg" style="margin-right: 5px" />
          <div class="handleText">查看</div>
        </div>
        <div class="icon-text-class" @click.stop="handleRemove" v-if="!elformDisabled">
          <img src="@/assets/ItemImg/jgshc.svg" style="margin-right: 5px" />
          <div class="handleDelText">删除</div>
        </div>
      </div>
    </el-upload>

    <!-- <div v-if="!fileUrl && !elformDisabled" class="upload__tip">
      支持上传图片格式：JPG/PNG/GIF，大小≤100MB。点击选择文件，或直接拖拽图片至此处
    </div> -->
    <label
      style="
        text-align: center;
        height: 30px;
        font-size: 15px;
        line-height: 30px;
        font-weight: 500;
      "
      >{{ label }}</label
    >
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Delete } from "@element-plus/icons-vue";
import { downloadHref } from "./index.js";
import { ElMessage } from "element-plus";

const props = defineProps({
  fileUrl: String,
  label: String,
  elformDisabled: Boolean,
  onSuccess: Function,
  onRemove: Function,
});

const emit = defineEmits(["update:fileUrl"]);

const isHover = ref(false);
const delHover = ref(false);
const headers = ref({
  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
});
const handleUpload = () => {
  document.querySelector(".el-upload").click();
};
const handleUploadSuccess = (res) => {
  emit("update:fileUrl", res.url);
  ElMessage.success("上传成功");
  if (props.onSuccess) props.onSuccess(res.url);
};

const handleRemove = () => {
  emit("update:fileUrl", "");
  if (props.onRemove) props.onRemove();
};

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.name.length > 100) {
    ElMessage.error(
      "尊敬的用户，您上传的文件大小超过100MB，请压缩文件大小后重新上传。"
    );
    return false;
  }
  return true;
};

const viewFile = (url) => {
  if (url) window.open(url);
};

const downFile = (url) => {
  if (url) {
    const fileName = url.split("/").pop();
    downloadHref(url, props.label);
  } else {
    ElMessage.warning("请上传一个文件");
  }
};
</script>

<style lang="scss" scoped>
.contentBox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .upload__tip {
    font-size: 10px;
    height: 0px;
    color: #9e9d9d;
  }
}
.avatar-uploader {
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 30px);
  position: relative;
  // border: 1px dashed rgb(199, 195, 195);

  .upload-icon {
    display: flex;
    // flex-direction: column;
    align-items: center;
    height: 100%;

    .uploadImg {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .uploadText {
      // margin-top: 10px;
      font-size: 14px;
      color: black;
      font-weight: 400;
      color: rgba(0, 115, 237, 1);
    }

    &:hover {
      .uploadText {
        color: rgb(83, 128, 253);
      }
    }
  }

  :deep(.el-upload.is-disabled) {
    background-color: transparent !important;
  }
}

.avatar-uploader:hover {
  // border: 1px dashed rgb(83, 128, 253, 1);
  cursor: pointer;
}

.handle-icon-class {
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 0 0 16px 16px;
  background-color: #faf9f8;
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;

  .icon-text-class {
    display: flex;
    height: 32px;
    align-items: center;
    margin-right: 20px;

    .handleText {
      color: rgba(0, 115, 237, 1);
      height: 32px;
      line-height: 32px;
      font-size: 14px;
    }
    .handleDelText{
      color: rgba(192, 0, 0, 1);
      height: 32px;
      line-height: 32px;
      font-size: 14px;
    }
  }
  .icon-text-class:last-child {
    margin-right: 0;
  }
}

.hover-show .image-preview {
  display: inline-block;
  border-radius: 16px;
  width: 99%;
  height: 99%;
  margin: auto;
  border: none;
  position: relative;
  .imgBox {
    height: 100%;
    width: 100%;
    object-fit: cover;
    border-radius: 12px;
    border: none;
  }
}

.hover-show .mask-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 99%;
  height: 99%;
  margin: auto;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 16px;
}

.hover-show:hover .mask-layer {
  opacity: 1;
  border: 1px solid rgba(83, 128, 253, 1);
}

.mask-layer .el-icon {
  color: white;
  font-size: 24px;
  margin: 0 10px;
  cursor: pointer;
}

.upload-icon-disabled {
  cursor: not-allowed;
}
</style>