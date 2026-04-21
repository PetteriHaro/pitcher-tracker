import { Checkbox, Paper, Button, Group } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

interface Props {
  gym: boolean;
  onToggle: (val: boolean) => void;
  onOpenGymTab: () => void;
}

export default function GymSection({ gym, onToggle, onOpenGymTab }: Props) {
  return (
    <Paper withBorder p="md" radius="md" mt="md" bg="dark.6">
      <div className="section-title" style={{ marginBottom: 10 }}>Gym</div>
      <Group justify="space-between" wrap="nowrap">
        <Checkbox
          size="md"
          color="accent"
          label="Done"
          checked={gym}
          onChange={(e) => onToggle(e.currentTarget.checked)}
          style={{ flex: 1 }}
        />
        <Button
          variant="subtle"
          color="accent"
          size="xs"
          rightSection={<IconExternalLink size={14} />}
          onClick={onOpenGymTab}
        >
          Open Gym
        </Button>
      </Group>
    </Paper>
  );
}
