export type HTMLInputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "datetime-local"
  | "month"
  | "time"
  | "week"
  | "url"
  | "search"
  | "tel"
  | "color"
  | "checkbox"
  | "radio"
  | "file"
  | "range"
  | "hidden"
  | "button"
  | "submit"
  | "reset";


  export enum FetchMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
  }