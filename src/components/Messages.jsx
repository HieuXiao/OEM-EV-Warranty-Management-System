export default function Messages({ msg }) {
  return (
    <a key={msg.id} href="#" className="dropdown-item">
      <div className="d-flex align-items-center">
        <img
          className="rounded-circle"
          src="../image/user.jpg"
          alt="user"
          style={{ width: "40px", height: "40px" }}
        />
        <div className="ms-2">
          <h6 className="fw-normal mb-0">{msg.text}</h6>
          <small>{msg.time}</small>
        </div>
      </div>
    </a>
  );
}
