import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { getUser } from "../../api/axios"; // Assuming getUser is in 'src/api/axios.js'

/**
 * Formats the user object received from the backend to match frontend needs.
 * @param {object} user - The raw user object from the API.
 * @returns {object|null} The formatted user object or null.
 */
const formatUser = (user) => {
  
  if (!user) {

    return null;
  }

  
  const {userName}=user
  const firstName=userName?.split(" ")[0];
  const lastName=userName?.split(" ")[1]

  const formattedUser={
    ...user,
    id: user._id,
    firstName,
    lastName
  };

  return formattedUser


};


export const userQueryAtom =atomWithQuery(() => ({
  queryKey: ['user'],
  queryFn: getUser,
  select: (user) => {
    const formattedUser=  formatUser(user)
   
    
    return formattedUser
  },
  
  
  retry: false,
}))



