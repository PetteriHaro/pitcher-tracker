import { useEffect, useState } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: (close: () => void) => React.ReactNode;
}

export default function Modal({ title, onClose, children, footer }: Props) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 260);
  }

  return (
    <div
      className={`modal-overlay${closing ? " closing" : ""}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-actions">{footer(handleClose)}</div>}
      </div>
    </div>
  );
}
