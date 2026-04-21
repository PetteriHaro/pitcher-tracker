import { notifications } from "@mantine/notifications";

export function reportError(context: string, err: unknown): void {
  let detail: string;
  if (err instanceof Error) detail = err.message;
  else if (err && typeof err === "object" && "message" in err) {
    detail = String((err as { message: unknown }).message);
  } else detail = String(err);
  console.error(`${context}: ${detail}`, err);
  notifications.show({
    title: context,
    message: detail,
    color: "red",
    autoClose: 5000,
    withCloseButton: true,
  });
}
