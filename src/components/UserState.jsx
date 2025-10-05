export default function UserState() {
  return (
    <div className="d-flex align-items-center ms-4 mb-4">
      <div className="position-relative">
        <img
          className="rounded-circle"
          src="../image/user.jpg"
          alt=""
          style={{ width: "40px", height: "40px" }}
        />
        <div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1"></div>
      </div>
      <div className="ms-3">
        <h6 className="mb-0">Jhon Doe</h6>
        <span>Admin</span>
      </div>
    </div>
  );
}
