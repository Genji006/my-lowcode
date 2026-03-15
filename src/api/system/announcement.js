import http from "@/utils/request";

export let insertNotice = (data) => http.post('/system/upgradeNotice/insert', data);
export let updateNotice = (data) => http.post('/system/upgradeNotice/update', data);
export let deleteNotice = (data) => http.post('/system/upgradeNotice/delete', data);
