import { useEffect, useState } from 'react';
import { Dropdown, Table, Button } from 'flowbite-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Assignment {
  id: string;
  role: string;
  created_at: string;
  employee: {
    id: string;
    full_name: string;
    position: string;
  };
  project: {
    id: string;
    project_name: string;
    status: string;
  };
}

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const tableActionData = [
    { icon: 'solar:pen-new-square-broken', listtitle: 'Edit', action: 'edit' },
    { icon: 'solar:trash-bin-minimalistic-outline', listtitle: 'Delete', action: 'delete' },
  ];

  // Fetch data dari employee_projects JOIN employees + projects
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('employee_projects').select(`
          id,
          role,
          created_at,
          employee:employees ( id, full_name, position ),
          project:projects ( id, project_name, status )
        `);

      if (error) throw error;
      setAssignments(data as any);
    } catch (err: any) {
      console.error('Error fetching assignments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus data?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('employee_projects').delete().eq('id', id);
      if (error) throw error;

      setAssignments((prev) => prev.filter((a) => a.id !== id));

      Swal.fire({
        title: 'Berhasil!',
        text: 'Assignment berhasil dihapus.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Error deleting assignment:', err.message);
      Swal.fire({
        title: 'Gagal!',
        text: err.message || 'Terjadi kesalahan saat menghapus assignment.',
        icon: 'error',
      });
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/assignment/${id}`);
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex items-center justify-between mb-4">
        <h5 className="card-title">Daftar Penugasan Project</h5>
        <Button color="primary" onClick={() => navigate('/add/assignment')}>
          + Tambah Assignment
        </Button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Pegawai</Table.HeadCell>
            <Table.HeadCell>Project</Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell>Tanggal Assign</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border dark:divide-darkborder">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : assignments.length > 0 ? (
              assignments.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.employee?.full_name}</Table.Cell>
                  <Table.Cell>{item.project?.project_name}</Table.Cell>
                  <Table.Cell>{item.role}</Table.Cell>
                  <Table.Cell>{new Date(item.created_at).toLocaleDateString('id-ID')}</Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                          <HiOutlineDotsVertical size={22} />
                        </span>
                      )}
                    >
                      {tableActionData.map((action, idx) => (
                        <Dropdown.Item
                          key={idx}
                          className="flex gap-3"
                          onClick={() => {
                            if (action.action === 'edit') {
                              handleEdit(item.id);
                            } else if (action.action === 'delete') {
                              handleDelete(item.id);
                            }
                          }}
                        >
                          <Icon icon={action.icon} height={18} />
                          <span>{action.listtitle}</span>
                        </Dropdown.Item>
                      ))}
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-4">
                  Tidak ada data penugasan
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export { Assignments };
