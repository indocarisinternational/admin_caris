import { useState, useEffect } from 'react';
import { Label, TextInput, Button, Select } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

const EditAssignments = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [role, setRole] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Ambil data assignment berdasarkan ID
  useEffect(() => {
    const fetchAssignment = async () => {
      setLoadingData(true);
      try {
        const { data, error } = await supabase
          .from('employee_projects')
          .select('id, role, employee_id, project_id')
          .eq('id', id)
          .single();

        if (error) throw error;

        setEmployeeId(data.employee_id);
        setProjectId(data.project_id);
        setRole(data.role);
      } catch (err: any) {
        Swal.fire({ icon: 'error', title: 'Gagal memuat data', text: err.message });
        navigate('/assignments');
      } finally {
        setLoadingData(false);
      }
    };

    if (id) fetchAssignment();
  }, [id, navigate]);

  // Ambil daftar employees & projects
  useEffect(() => {
    const fetchOptions = async () => {
      const { data: empData } = await supabase.from('employees').select('id, full_name, position');
      const { data: projData } = await supabase.from('projects').select('id, project_name, status');
      setEmployees(empData || []);
      setProjects(projData || []);
    };
    fetchOptions();
  }, []);

  // Proses update assignment
  const handleSubmit = async () => {
    try {
      if (!employeeId || !projectId || !role) {
        Swal.fire({ icon: 'warning', title: 'Lengkapi semua data' });
        return;
      }

      setLoading(true);

      const { error } = await supabase
        .from('employee_projects')
        .update({
          employee_id: employeeId,
          project_id: projectId,
          role,
        })
        .eq('id', id);

      if (error) throw error;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Assignment berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/assignments');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui assignment',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="card-title">Edit Assignment</h5>

      {loadingData ? (
        // Skeleton loading
        <div className="animate-pulse mt-6 flex flex-col gap-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-10 bg-gray-300 rounded w-1/4"></div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {/* Pilih Pegawai */}
          <div>
            <Label htmlFor="employee" value="Pegawai" className="mb-2 block" />
            <Select
              id="employee"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Pilih Pegawai...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.position})
                </option>
              ))}
            </Select>
          </div>

          {/* Pilih Project */}
          <div>
            <Label htmlFor="project" value="Project" className="mb-2 block" />
            <Select
              id="project"
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Pilih Project...</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.project_name} ({proj.status})
                </option>
              ))}
            </Select>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" value="Role" className="mb-2 block" />
            <TextInput
              id="role"
              type="text"
              placeholder="Masukkan role pegawai di project..."
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 mt-4">
            <Button color="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update'}
            </Button>
            <Button color="error" onClick={() => navigate('/assignments')} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAssignments;
