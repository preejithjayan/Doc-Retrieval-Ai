import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import ModelCard from '../../components/models/ModelCard';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import { modelsApi } from '../../lib/api/models';
import { useAuthStore } from '../../stores/authStore';
import { useModelStore } from '../../stores/modelStore';

export default function ModelsPage() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role_code);
  const canSwitch = role === 'ADMIN';
  const setModelData = useModelStore((state) => state.setModelData);

  const modelsQuery = useQuery({
    queryKey: ['models-page'],
    queryFn: async () => {
      const { data } = await modelsApi.current();
      setModelData({ currentModel: data.current, catalog: data.catalog || [] });
      return data;
    },
  });

  const switchMutation = useMutation({
    mutationFn: async (modelName) => {
      const { data } = await modelsApi.switch({ model_name: modelName });
      return data;
    },
    onSuccess: () => {
      toast.success('Model switched successfully.');
      queryClient.invalidateQueries({ queryKey: ['models-page'] });
      queryClient.invalidateQueries({ queryKey: ['model-current'] });
    },
    onError: () => {
      toast.error('Unable to switch the model.');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Models"
        title="Model routing"
        description="Inspect available model profiles and, if permitted, change the active model used for retrieval-augmented responses."
        meta={[
          <Badge key="admin" tone={canSwitch ? 'warning' : 'default'}>{canSwitch ? 'Switching enabled' : 'Read only'}</Badge>,
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {modelsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-80 rounded-[28px]" />)
        ) : modelsQuery.data?.catalog?.length ? (
          modelsQuery.data.catalog.map((model) => (
            <ModelCard key={model.id} model={model} canSwitch={canSwitch} onSwitch={switchMutation.mutate} />
          ))
        ) : (
          <EmptyState title="No model profiles available" description="The model catalog will appear here once the backend exposes active model records." />
        )}
      </section>
    </div>
  );
}

