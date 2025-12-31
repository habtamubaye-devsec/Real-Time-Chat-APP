import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GeneralState  {
    isProfileSettingModalOpen: boolean;
    isLoginModalOpen: boolean;
    isCreateRoomModalOpen: boolean;
    toggleProfileSettingModal: () => void;
    toggleLoginModal: () => void;
    toggleCreateRoomModal: () => void;
};



export  const useGeneralStore = create<GeneralState>()(
    persist(
        (set) => ({
            isProfileSettingModalOpen: false,   
            isLoginModalOpen: false,
            isCreateRoomModalOpen: false,

            toggleProfileSettingModal: () =>
                set((state) => ({
                    isProfileSettingModalOpen: !state.isProfileSettingModalOpen,
                })),
            toggleLoginModal: () =>
                set((state) => ({
                    isLoginModalOpen: !state.isLoginModalOpen,
                })),
            toggleCreateRoomModal: () =>
                set((state) => ({
                    isCreateRoomModalOpen: !state.isCreateRoomModalOpen,
                })),
        }),
        {
            name: "general-store",
        }
    )
);