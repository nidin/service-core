/* tslint:disable-next-line  */
import axiosOriginal from "axios";
axiosOriginal.defaults.adapter = require("axios/lib/adapters/http");
export const axios = axiosOriginal;
