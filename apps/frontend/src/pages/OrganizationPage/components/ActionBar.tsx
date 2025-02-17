interface ActionBarProps {
  canCreate: boolean;
  onCreateClick: () => void;
}

export const ActionBar = ({ canCreate, onCreateClick }: ActionBarProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">Workspaces</h1>
      {canCreate && (
        <button onClick={onCreateClick} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Create Workspace
        </button>
      )}
    </div>
  );
};
