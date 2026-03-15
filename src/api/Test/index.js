import http from "@/utils/request";

export function getViewDetail(data) {
  return http("/business/mrmsTableManger/commonQuery", {
    ...data,
  });
}
