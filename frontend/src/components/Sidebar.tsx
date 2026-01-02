import { useState } from "react";
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconLogin,
  IconLogout,
  IconMessage,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
} from "@tabler/icons-react";
import { Center, Stack, Tooltip, UnstyledButton } from "@mantine/core";
import { useGeneralStore } from "../../stores/generalStore";
import { useUserStore } from "../../stores/userStore";
import classes from "./NavbarMinimal.module.css";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip
      label={label}
      position="right"
      withArrow
      transitionProps={{ duration: 500, transition: "slide-right" }}
      offset={20}
    >
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={28} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: "Home" },
  { icon: IconGauge, label: "Dashboard" },
  { icon: IconDeviceDesktopAnalytics, label: "Analytics" },
  { icon: IconCalendarStats, label: "Releases" },
  { icon: IconUser, label: "Account" },
  { icon: IconFingerprint, label: "Security" },
  { icon: IconSettings, label: "Settings" },
];

export default function Sidebar() {
  const [active, setActive] = useState(2);
  const userId = useUserStore((state) => state.id);
  const fullName = useUserStore((state) => state.fullName);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);
  const toggleProfileSettingModal = useGeneralStore(
    (state) => state.toggleProfileSettingModal
  );

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center className={classes.logo_container}>
        <div className={classes.logo_bg}>
          <IconMessage size={24} color="white" />
        </div>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={8}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        {userId && (
          <NavbarLink
            icon={IconUser}
            label={`Profile ${fullName}`}
            onClick={toggleProfileSettingModal}
          />
        )}
        {userId ? (
          <NavbarLink
            icon={IconLogout}
            label="Logout"
            onClick={() => {
              if (!userId) return;
            toggleLoginModal();
          }}
        />
        ) : (
          <NavbarLink
            icon={IconLogin}
            label="Login"
            onClick={() => {
              if (!userId) return;
            toggleLoginModal();
          }}
        />
        )}
      </Stack>
    </nav>
  );
}
