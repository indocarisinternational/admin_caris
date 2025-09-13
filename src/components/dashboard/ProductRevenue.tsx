import { useEffect, useState } from 'react';
import { Badge, Table } from 'flowbite-react';
import SimpleBar from 'simplebar-react';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Project {
  id: string;
  project_name: string;
  status: string | null;
  jumlah_fitur: number | null;
  total_fitur: number | null;
  image_url: string | null;
  jenis_project: string | null;
  client: {
    id: string;
    nama_client: string;
  } | null;
}

const ProductRevenue = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          id,
          project_name,
          status,
          jumlah_fitur,
          total_fitur,
          jenis_project,
          image_url,
          clients (
            id,
            nama_client
          )
        `,
        )
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        Swal.fire('Error', error.message, 'error');
        setLoading(false);
        return;
      }

      const mapped = data.map((item: any) => {
        const { data: urlData } = supabase.storage.from('projects').getPublicUrl(item.image_url);

        return {
          id: item.id,
          project_name: item.project_name,
          status: item.status,
          jumlah_fitur: item.jumlah_fitur,
          total_fitur: item.total_fitur,
          jenis_project: item.jenis_project,
          image_url: urlData?.publicUrl || '',
          client: item.clients
            ? { id: item.clients.id, nama_client: item.clients.nama_client }
            : null,
        };
      });

      setProjects(mapped);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const getProgress = (jumlah: number | null, total: number | null) => {
    if (!jumlah || !total || total === 0) return '0%';
    return ((jumlah / total) * 100).toFixed(1) + '%';
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-lightsuccess text-success';
      case 'pending':
        return 'bg-lightwarning text-warning';
      case 'completed':
        return 'bg-lightsecondary text-secondary';
      case 'cancelled':
        return 'bg-lighterror text-error';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray pt-6 px-0 relative w-full break-words">
      <div className="px-6">
        <h5 className="card-title mb-6">Revenue by Project</h5>
      </div>
      <SimpleBar className="max-h-[450px]">
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">Assigned</Table.HeadCell>
              <Table.HeadCell>Progress</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Jenis Project</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder ">
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={4} className="text-center py-6">
                    Loading...
                  </Table.Cell>
                </Table.Row>
              ) : projects.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4} className="text-center py-6">
                    Tidak ada data project
                  </Table.Cell>
                </Table.Row>
              ) : (
                projects.map((item) => (
                  <Table.Row key={item.id}>
                    {/* Assigned */}
                    <Table.Cell className="whitespace-nowrap ps-6">
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.image_url || '/placeholder.png'}
                          alt="project"
                          className="h-[60px] w-[60px] rounded-md object-cover"
                        />
                        <div className="truncate line-clamp-2 sm:text-wrap max-w-56">
                          <h6 className="text-sm">{item.project_name}</h6>
                          <p className="text-xs ">{item.client ? item.client.nama_client : '-'}</p>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Progress */}
                    <Table.Cell>
                      <p className="text-base">
                        {getProgress(item.jumlah_fitur, item.total_fitur)}
                      </p>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      <Badge className={getStatusColor(item.status)}>{item.status || '-'}</Badge>
                    </Table.Cell>

                    {/* Jenis Project */}
                    <Table.Cell>
                      <h4>{item.jenis_project || '-'}</h4>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </SimpleBar>
    </div>
  );
};

export default ProductRevenue;
