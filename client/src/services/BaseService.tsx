import axios from "axios";
import { DOMAIN_NAME, TOKEN } from "../util/constants/SettingSystem";

export class BaseService {
  put(url: string, model: any) {
    return axios({
      url: `${DOMAIN_NAME}${url}`,
      method: "PUT",
      data: model,
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN) },
    });
  }
  post(url: string, model: any) {
    return axios({
      url: `${DOMAIN_NAME}${url}`,
      method: "POST",
      data: model,
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN) },
    });
  }
  get(url: string) {
    return axios({
      url: `${DOMAIN_NAME}${url}`,
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN) },
    });
  }
  delete(url: string) {
    return axios({
      url: `${DOMAIN_NAME}${url}`,
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN) },
    });
  }
}
