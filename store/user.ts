import createNewStore from "@/zustand/index"

// Types
export interface User {
  address:string | null
}

// Initial State (demo address for product demo — set to null for production)
const initialState: User = {
  address: "0xc461...c5c7",
};

// Export Store
export const useUserStore = createNewStore(initialState, {
  name: "user-store",
  devTools: true,
  persist: true,
});

