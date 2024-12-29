import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Clock, Archive, XCircle, CheckCircle, Settings, Download, Upload, Trash2 } from 'lucide-react';

const formatDateTime = (update) => {
  if (update.timestamp) {
    return `${new Date(update.timestamp).toLocaleDateString()} at ${update.time}`;
  } else if (update.date) {
    return update.date;
  }
  return 'No date available';
};

const STATUS_COLORS = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-amber-400',
  Stale: 'bg-orange-500',
  Completed: 'bg-sky-500',
  Archived: 'bg-zinc-400',
  Abandoned: 'bg-rose-500'
};

const FadeIn = ({ children }) => (
  <div className="animate-fadeIn">
    {children}
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
        >
          <XCircle size={24} />
        </button>
        {children}
      </div>
    </div>
  </div>
);

const SidePanel = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50">
    <div className="absolute right-0 top-0 h-full w-1/3 min-w-[400px] bg-white shadow-lg p-6 animate-slide-in">
      <div className="relative h-full">
        <button 
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
        >
          <XCircle size={24} />
        </button>
        <div className="h-full overflow-y-auto pt-8">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const SettingsMenu = ({ onExport, onImport, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          onImport(data);
        } catch (error) {
          alert('Error importing file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onExport();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export Data
          </button>
          <button
            onClick={handleImportClick}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Import Data
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                onClear();
                setIsOpen(false);
              }
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600"
          >
            <Trash2 size={16} className="mr-2" />
            Clear All Data
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
        onClick={(e) => {
          e.target.value = null;
        }}
      />
    </div>
  );
};

const AddActivityModal = ({ onClose, onAdd }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    startDate: today,
    motivation: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newActivity = {
      id: Date.now(),
      ...formData,
      updates: []
    };
    onAdd(newActivity);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-6">Add New Activity</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter activity name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter activity description"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What inspired you to start this activity? Share your motivation and future goals.
            </label>
            <textarea
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Share your inspiration, intentions, and plans..."
              rows="4"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              {Object.keys(STATUS_COLORS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Activity
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const ActivityCard = ({ activity, onClick }) => {
  const lastUpdate = activity.updates[0];
  
  return (
    <FadeIn>
      <div 
        onClick={onClick}
        className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-4 cursor-pointer 
                  hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300
                  hover:translate-y-[-2px]"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">{activity.name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${STATUS_COLORS[activity.status]} 
                          transition-colors duration-300`}>
            {activity.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="text-gray-500 text-sm flex items-center">
            <Clock size={14} className="mr-1.5 text-gray-400" />
            {activity.updates.length} updates
          </div>
          {lastUpdate && (
            <div className="text-gray-400 text-sm flex items-center">
              <CheckCircle size={14} className="mr-1.5 opacity-60" />
              Last updated - {formatDateTime(lastUpdate)}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
};

const ActivityDetail = ({ activity, onClose, onStatusChange, onAddUpdate, onDelete }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleAddUpdate = () => {
    if (newUpdate.trim()) {
      const now = new Date();
      const update = {
        id: Date.now(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString(),
        timestamp: now.toISOString(),
        text: newUpdate.trim()
      };
      onAddUpdate(activity.id, update);
      setNewUpdate('');
    }
  };

  return (
    <SidePanel onClose={onClose}>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">{activity.name}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Settings size={20} />
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this activity?')) {
                      onDelete(activity.id);
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Activity
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
          >
            <XCircle size={20} />
          </button>
        </div>
      </div>
      
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-2">
          Started on {new Date(activity.startDate).toLocaleDateString()}
        </div>
        <div className="mb-4">{activity.description}</div>
        <div className="border-t pt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Motivation & Goals</div>
          <div className="text-gray-600">{activity.motivation}</div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select 
          value={activity.status}
          onChange={(e) => onStatusChange(activity.id, e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {Object.keys(STATUS_COLORS).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Updates</h3>
        
        <div className="mb-4">
          <textarea
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Add a new update..."
            className="w-full p-2 border rounded-md"
            rows="3"
          />
          <button
            onClick={handleAddUpdate}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Update
          </button>
        </div>

        <div className="space-y-4">
          {activity.updates.map(update => (
            <div key={update.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="w-px flex-1 bg-gray-200"></div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDateTime(update)}
                </div>
                <div className="text-gray-700">{update.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidePanel>
  );
};

const ActivitySection = ({ title, icon: Icon, activities, onActivityClick }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-3">
        <Icon size={24} />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {activities.length > 0 && (
        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-sm">
          {activities.length}
        </span>
      )}
    </div>
    {activities.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onClick={() => onActivityClick(activity)}
          />
        ))}
      </div>
    ) : (
      <div className="text-gray-500 text-sm italic bg-gray-50 rounded-lg p-4 flex items-center justify-center">
        No activities in this section yet
      </div>
    )}
  </section>
);

const LeisureLog = () => {
  const [activities, setActivities] = useState(() => {
    const savedActivities = localStorage.getItem('leisureLogActivities');
    return savedActivities ? JSON.parse(savedActivities) : [];
  });

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('leisureLogActivities', JSON.stringify(activities));
  }, [activities]);

  const handleStatusChange = (activityId, newStatus) => {
    const updatedActivities = activities.map(activity =>
      activity.id === activityId
        ? { ...activity, status: newStatus }
        : activity
    );
    setActivities(updatedActivities);
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity({ ...selectedActivity, status: newStatus });
    }
  };

  const handleAddUpdate = (activityId, update) => {
    const updatedActivities = activities.map(activity =>
      activity.id === activityId
        ? { ...activity, updates: [update, ...activity.updates] }
        : activity
    );
    setActivities(updatedActivities);
    if (selectedActivity && selectedActivity.id === activityId) {
      setSelectedActivity({
        ...selectedActivity,
        updates: [update, ...selectedActivity.updates]
      });
    }
  };

  const handleAddActivity = (newActivity) => {
    setActivities([...activities, newActivity]);
  };

  const handleDeleteActivity = (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(activities.filter(activity => activity.id !== activityId));
      setSelectedActivity(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leisure-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (data) => {
    if (Array.isArray(data)) {
      setActivities(data);
    }
  };

  const handleClearData = () => {
    setActivities([]);
    localStorage.removeItem('leisureLogActivities');
  };

  const groupedActivities = {
    active: activities.filter(a => a.status === 'Active'),
    inactive: activities.filter(a => ['Inactive', 'Stale'].includes(a.status)),
    completed: activities.filter(a => a.status === 'Completed'),
    archived: activities.filter(a => a.status === 'Archived'),
    abandoned: activities.filter(a => a.status === 'Abandoned')
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] bg-subtle-pattern bg-fixed px-8 py-6" style={{ backgroundColor: '#F6F5F2' }}>
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <img src="/tree.svg" alt="Tree Icon" className="w-8 h-8" />
            Leisure Log</h1>
          <div className="flex items-center gap-4">
            <SettingsMenu 
              onExport={handleExport}
              onImport={handleImport}
              onClear={handleClearData}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
            >
              <PlusCircle className="mr-2" size={20} />
              Add Activity
            </button>
          </div>
        </div>
        <hr className="border-gray-200 mb-8" />

        <ActivitySection
          title="Active Activities"
          icon={(props) => <Clock {...props} className="text-green-500" />}
          activities={groupedActivities.active}
          onActivityClick={setSelectedActivity}
        />

        <ActivitySection
          title="Inactive Activities"
          icon={(props) => <Clock {...props} className="text-yellow-500" />}
          activities={groupedActivities.inactive}
          onActivityClick={setSelectedActivity}
        />

        <ActivitySection
          title="Completed Activities"
          icon={(props) => <CheckCircle {...props} className="text-blue-500" />}
          activities={groupedActivities.completed}
          onActivityClick={setSelectedActivity}
        />

        <ActivitySection
          title="Archived Activities"
          icon={(props) => <Archive {...props} className="text-gray-500" />}
          activities={groupedActivities.archived}
          onActivityClick={setSelectedActivity}
        />

        <ActivitySection
          title="Abandoned Activities"
          icon={(props) => <XCircle {...props} className="text-red-500" />}
          activities={groupedActivities.abandoned}
          onActivityClick={setSelectedActivity}
        />

        {showAddModal && (
          <AddActivityModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddActivity}
          />
        )}

        {selectedActivity && (
          <ActivityDetail
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onStatusChange={handleStatusChange}
            onAddUpdate={handleAddUpdate}
            onDelete={handleDeleteActivity}
          />
        )}
      </div>
    </div>
  );
};

export default LeisureLog;