const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  ""
);

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Message = ({ message, isOwn, onForward }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const attachment = message.attachment;
  const attachmentUrl = attachment?.url?.startsWith("http")
    ? attachment.url
    : `${API_ORIGIN}${attachment?.url || ""}`;
  const isImage = attachment?.fileType === "image" || attachment?.mimeType?.startsWith("image/");

  return (
    <div className={`msg-row ${isOwn ? "sent" : "recv"}`}>
      <div>
        <div className="bubble">
          {message.forwardedFrom && <div className="forwarded-label">Forwarded</div>}

          {message.text && <p className="message-text">{message.text}</p>}

          {isImage && (
            <a href={attachmentUrl} target="_blank" rel="noreferrer">
              <img className="message-image" src={attachmentUrl} alt={attachment.fileName} />
            </a>
          )}

          {attachment && !isImage && (
            <a className="file-card" href={attachmentUrl} target="_blank" rel="noreferrer" download>
              <span className="file-icon">
                {attachment.mimeType === "application/pdf" ? "PDF" : "DOC"}
              </span>
              <span>
                <strong>{attachment.fileName}</strong>
                <small>{formatFileSize(attachment.size)}</small>
              </span>
            </a>
          )}
        </div>
        <div className="message-meta">
          <span className="msg-time">{time}</span>
          <button type="button" className="forward-btn" onClick={() => onForward(message)}>
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
