import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme, Modal } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./style.css";
import App from "./App";

const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  colors: {
    // Map our CSS vars into a Mantine color scale so primary buttons etc.
    // match the existing --accent (#6c8aff).
    accent: [
      "#eef1ff", "#d6deff", "#adbbff", "#8195ff", "#6c8aff",
      "#5c7aff", "#4a6adf", "#3a56c0", "#2c40a0", "#1f2e80",
    ],
  },
  components: {
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: { transition: "fade-up", duration: 250, timingFunction: "ease" },
        overlayProps: { backgroundOpacity: 0.6, blur: 4 },
      },
    }),
  },
});

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications position="top-center" />
      <App />
    </MantineProvider>
  </StrictMode>,
);
