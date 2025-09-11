import { useEffect, useState } from 'react';
import { Badge, Dropdown, Table, Button } from 'flowbite-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Project {
  id: string;
  project_name: string;
  client: string;
  created_at: string;
  status: string;
  image_url: string; // path di storage, misalnya "images/xxx.jpg"
}

const SkeletonRow = () => (
  <Table.Row>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-10 animate-pulse"></div>
    </Table.Cell>
  </Table.Row>
);

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data project
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, client, created_at, status, image_url')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching projects:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengambil data',
          text: error.message,
        });
      } else if (data) {
        const updatedData = data.map((item) => {
          const { data: urlData } = supabase.storage.from('projects').getPublicUrl(item.image_url);
          return {
            ...item,
            image_url: urlData?.publicUrl || '',
          };
        });
        setProjects(updatedData);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // Edit Project
  const handleEdit = (id: string) => {
    navigate(`/edit/project/${id}`);
  };

  // Delete dengan SweetAlert konfirmasi
  const handleDelete = (id: string, imagePath: string) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Menghapus project...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          // Hapus file storage
          const { error: storageError } = await supabase.storage
            .from('projects')
            .remove([imagePath]);
          if (storageError) throw new Error(storageError.message);

          // Hapus data table
          const { error: tableError } = await supabase.from('projects').delete().eq('id', id);
          if (tableError) throw new Error(tableError.message);

          // Update state
          setProjects((prev) => prev.filter((p) => p.id !== id));

          Swal.fire('Dihapus!', 'Project berhasil dihapus.', 'success');
        } catch (error: any) {
          Swal.fire('Gagal', error.message || 'Terjadi kesalahan', 'error');
        }
      }
    });
  };

  // Warna badge status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'failure';
      default:
        return 'gray';
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h5 className="card-title">Caris Projects</h5>
        <Button color="primary" onClick={() => navigate('/add/project')}>
          + Tambah Project
        </Button>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="p-6">Project</Table.HeadCell>
            <Table.HeadCell>Client</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border dark:divide-darkborder">
            {loading ? (
              Array(5)
                .fill(null)
                .map((_, i) => <SkeletonRow key={i} />)
            ) : projects.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-6 text-gray-500">
                  Data project kosong
                </Table.Cell>
              </Table.Row>
            ) : (
              projects.map((item) => (
                <Table.Row key={item.id}>
                  {/* Project */}
                  <Table.Cell className="whitespace-nowrap ps-6">
                    <div className="flex gap-3 items-center">
                      <img
                        src={item.image_url}
                        alt="project"
                        className="h-[60px] w-[60px] rounded-md object-cover"
                      />
                      <div className="truncate line-clamp-2 max-w-56">
                        <h6 className="text-sm">{item.project_name}</h6>
                      </div>
                    </div>
                  </Table.Cell>

                  {/* Client */}
                  <Table.Cell>
                    <span className="text-sm font-medium text-dark">{item.client}</span>
                  </Table.Cell>

                  {/* Date */}
                  <Table.Cell>
                    <span className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </Table.Cell>

                  {/* Status */}
                  <Table.Cell>
                    <Badge color={getStatusColor(item.status)}>{item.status}</Badge>
                  </Table.Cell>

                  {/* Actions */}
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
                      <Dropdown.Item onClick={() => handleEdit(item.id)} className="flex gap-3">
                        <Icon icon="solar:pen-new-square-broken" height={18} />
                        <span>Edit</span>
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() =>
                          handleDelete(
                            item.id,
                            item.image_url.replace(
                              /^.*\/storage\/v1\/object\/public\/projects\//,
                              '',
                            ),
                          )
                        }
                        className="flex gap-3"
                        
                      >
                        <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                        <span>Delete</span>
                      </Dropdown.Item>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export { Projects };
