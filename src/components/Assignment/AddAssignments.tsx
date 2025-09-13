import { useState, useEffect } from 'react';
import { Label, TextInput, Button, Select } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

const AddAssignments = () => {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Fetch daftar employees & projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('id, full_name, position');
        if (empError) throw empError;

        const { data: projData, error: projError } = await supabase
          .from('projects')
          .select('id, project_name, status');
        if (projError) throw projError;

        setEmployees(empData || []);
        setProjects(projData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!employeeId || !projectId || !role) {
        Swal.fire({ icon: 'warning', title: 'Lengkapi semua data' });
        return;
      }

      setLoading(true);

      // Insert ke employee_projects
      const { error: insertError } = await supabase.from('employee_projects').insert([
        {
          employee_id: employeeId,
          project_id: projectId,
          role: role,
        },
      ]);

      if (insertError) throw insertError;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Assignment berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/assignments');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menambahkan assignment',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="card-title">Tambah Assignment Project</h5>

      <div className="mt-6 flex flex-col gap-4">
        {/* Pilih Pegawai */}
        <div>
          <Label htmlFor="employee" value="Pilih Pegawai" className="mb-2 block" />
          <Select
            id="employee"
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">-- Pilih Pegawai --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.position})
              </option>
            ))}
          </Select>
        </div>

        {/* Pilih Project */}
        <div>
          <Label htmlFor="project" value="Pilih Project" className="mb-2 block" />
          <Select
            id="project"
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">-- Pilih Project --</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.project_name} ({proj.status})
              </option>
            ))}
          </Select>
        </div>

        {/* Role */}
        <div>
          <Label htmlFor="role" value="Role Pegawai di Project" className="mb-2 block" />
          <TextInput
            id="role"
            type="text"
            placeholder="Masukkan role, contoh: Frontend Developer"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3 mt-4">
          <Button color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Submit'}
          </Button>
          <Button color="error" onClick={() => navigate('/assignments')} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddAssignments;
