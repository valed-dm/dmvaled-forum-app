import { Dispatch } from "react";

export const allowSubmit = (
  dispatch: Dispatch<any>,
  msg: string,
  setDisabled: boolean
) => {
  dispatch({ type: "isSubmitDisabled", payload: setDisabled });
  dispatch({ type: "resultMsg", payload: msg });
};
