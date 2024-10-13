export enum HTMLInputType {
  Text = "text",
  Textarea = "textarea",
  Select = "select",
  Option = "option",
  Password = "password",
  Email = "email",
  Number = "number",
  Date = "date",
  DatetimeLocal = "datetime-local",
  Month = "month",
  Time = "time",
  Week = "week",
  Url = "url",
  Search = "search",
  Tel = "tel",
  Color = "color",
  Checkbox = "checkbox",
  Radio = "radio",
  File = "file",
  Range = "range",
  Hidden = "hidden",
  Button = "button",
  Submit = "submit",
  Reset = "reset",
}

export enum FetchMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface Error {
  statusCode: number;
  message: string;
}

export interface Snack extends Error {
  title?: string;
  type: "error" | "info" | "warning" | "success";
  timeout?: number;
}

export interface Pagination {
  take?: number;
  skip?: number;
  cursor?: string;
}

export enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type MediaType = "image" | "video" | "audio" | "file" | "link";
