import { Table, Empty } from "antd";

export default function GenericTable({
  columns,
  data,
  loading,
  rowKey,
  pagination,
  onRowClick,
}) {
  return (
    <Table
      columns={columns}
      dataSource={Array.isArray(data) ? data : []}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
      bordered
      size="middle"
      scroll={{ x: "max-content" }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No data found"
          />
        ),
      }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
      })}
    />
  );
}
