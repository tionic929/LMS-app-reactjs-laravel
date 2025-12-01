import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UpdateAccountModal from "../../components/modals/UpdateAccountModal";
import type { User } from "../../api/users";

const AccountUpdate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(true);

  // If not logged in or no user loaded, redirect back
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleClose = () => {
    setShow(false);
    navigate(-1); // go back to previous page
  };

  const handleSuccess = () => {
    // For now, just close and go back; parent list refresh not needed.
    handleClose();
  };

  return (
    <div className="p-4">
      {/* Optionally show a minimal page behind the modal */}
      <UpdateAccountModal
        show={show && !!user}
        user={user as User}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AccountUpdate;
