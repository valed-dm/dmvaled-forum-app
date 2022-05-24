import { useDispatch } from "react-redux";
import { gql, QueryLazyOptions, useLazyQuery } from "@apollo/client";
import { UserProfileSetType } from "../store/user/Reducer";

export const Me = gql`
  query Me {
    me {
      ... on EntityResult {
        messages
      }
      ... on User {
        id
        userName
        threads {
          id
          title
        }
        threadItems {
          id
          thread {
            id
          }
          body
        }
      }
    }
  }
`;

interface UseRefreshReduxMeResult {
  execMe: (options?: QueryLazyOptions<Record<string, any>> | undefined) => void;
  deleteMe: () => void;
  updateMe: () => void;
}

const useRefreshReduxMe = (): UseRefreshReduxMeResult => {
  const reduxDispatcher = useDispatch();

  const [execMe, { data }] = useLazyQuery(Me);

  const deleteMe = () => {
    reduxDispatcher({
      type: UserProfileSetType,
      payload: null,
    });
  };

  const updateMe = () => {
    if (data && data.me && data.me.userName) {
      reduxDispatcher({
        type: UserProfileSetType,
        payload: data.me,
      });
    }
  };

  return { execMe, deleteMe, updateMe };
};
export default useRefreshReduxMe;
