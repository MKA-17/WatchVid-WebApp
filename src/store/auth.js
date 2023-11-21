import { create } from "zustand";

export const useAuth = create((set) => ({
  auth: JSON.parse(window.localStorage.getItem("auth")) || { token: "", user: { id: "", name: "", email: "" } },
  setAuth: (value) =>
    set((state) => ({
      auth: typeof value === "function" ? value(state.auth) : value,
    })),
  logout: ()=>set((state)=>{
    window.localStorage.removeItem("auth");
    return {
      auth: { token: "", user: { id: "", name: "", email: "" } 
    }
  }
  }),
  subscription: (userId)=>set((state)=>{
    
    let subscribedUsers = state.auth.user?.subscribedUsers?.includes(userId) ? 
    state.auth.user?.subscribedUsers?.filter(e=>e !== userId ) :
    state.auth.user?.subscribedUsers?.concat(userId);
    
    const updatedAuth = {
      ...state.auth,
      user: {
        ...state.auth.user,
        subscribedUsers 
      }
    }
    window.localStorage.setItem("auth", JSON.stringify(updatedAuth));
    console.log("zustand subscription", updatedAuth, state.auth.user?.subscribedUsers?.includes(userId))
    return {auth: updatedAuth}
  })
}));
