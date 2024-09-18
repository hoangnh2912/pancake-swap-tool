import { createStandaloneToast } from "@chakra-ui/react";
const { ToastContainer, toast } = createStandaloneToast();
const logAsToast = (...message: string[]) => {
  toast({
    title: "Log",
    description: message.join(", "),
    status: "info",
    duration: 5000,
    isClosable: true,
    position: "top-right",
  });
  console.log(`${message.join(", ")}`);
};
export { logAsToast, ToastContainer };
