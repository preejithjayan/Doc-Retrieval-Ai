import { useState } from 'react';

import Button from '../ui/Button';
import Modal from '../ui/Modal';

const initialState = {
  fullName: '',
  email: '',
  password: '',
  roleCode: 'VIEWER',
};

export default function UserModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleClose = () => {
    setForm(initialState);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Add User</p>
        <h3 className="mt-3 font-display text-2xl font-semibold">Invite a new teammate.</h3>

        <div className="mt-6 grid gap-4">
          <input value={form.fullName} onChange={(event) => handleChange('fullName', event.target.value)} placeholder="Full Name" />
          <input type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} placeholder="Email" />
          <input type="password" value={form.password} onChange={(event) => handleChange('password', event.target.value)} placeholder="Temporary password" />
          <select value={form.roleCode} onChange={(event) => handleChange('roleCode', event.target.value)}>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ANALYST">ANALYST</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              onSubmit(form);
              setForm(initialState);
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
