// data - easy management

export const systemHealthData = {
  brainStatus: {
    status: 'Online',
    statusColor: '#045900',
    link: '/brain'
  },
  connectedDevices: 12,
  totalTokens: {
    count: '2,847,392',
    percentage: '+18%',
    isPositive: true
  }
};

export const memoryActivityData = {
  chunksCreated: {
    count: '1,247',
    percentage: '+23%',
    isPositive: true,
    link: '/memory'
  },
  heatmapDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  heatmapHours: 24,
  heatmapColors: {
    high: '#FFEA00',
    medium: '#FFF583',
    low: '#D9D9D9'
  },
  timeLabels: ['12am', '6am', '12pm', '6pm', '11pm']
};

export const workflowEngineData = {
  errors: [
    {
      id: 1,
      title: 'Sentiment Analysis',
      description: 'Model timeout after 30s - retrying with fallback',
      timestamp: '5 minutes ago'
    },
    {
      id: 2,
      title: 'Image Recognition',
      description: 'Invalid image format - preprocessing failed',
      timestamp: '12 minutes ago'
    }
  ]
};
