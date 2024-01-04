const data = {
  nodes: [
    {
      id: 'node_id_1',
      type: 'sql-node',
      x: 100,
      y: 100,
      properties: {
        tableName: 'Users',
        fields: [
          {
            key: 'id',
            type: 'string',
          },
          {
            key: 'name',
            type: 'string',
          },
          {
            key: 'age',
            type: 'integer',
          },
        ],
      },
    },
    {
      id: 'node_id_2',
      type: 'sql-node',
      x: 400,
      y: 200,
      properties: {
        tableName: 'Settings',
        fields: [
          {
            key: 'id',
            type: 'string',
          },
          {
            key: 'key',
            type: 'integer',
          },
          {
            key: 'value',
            type: 'string',
          },
        ],
      },
    },
  ],
  edges: [],
};
export default data;
