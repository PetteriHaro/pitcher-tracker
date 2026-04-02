interface ToggleProps {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}

export default function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="toggle-wrap">
      <span className="field-label">{label}</span>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="toggle-track" />
        <div className="toggle-thumb" />
      </label>
    </div>
  )
}
