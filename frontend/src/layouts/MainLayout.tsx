import { Flex } from "@mantine/core";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Flex h="100vh" w="100vw" align="stretch">
            {children}
        </Flex>
    );
};

export default MainLayout