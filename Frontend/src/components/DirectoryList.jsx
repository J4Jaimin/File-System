import DirectoryItem from "./DirectoryItem";

function DirectoryList({
  items,
  handleRowClick,
  activeContextMenu,
  contextMenuPos,
  handleContextMenu,
  getFileIcon,
  isUploading,
  progressMap,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  BASE_URL,
}) {
  return (
    <div className="directory-list">
      {items.length > 0 &&
        items.map((item, index) => {
          const uploadProgress = progressMap[item.id] || 0;
          const uniqueKey = item?.id || `temp-${index}-${Math.random()}`;

          return (
            <DirectoryItem
              key={uniqueKey}
              item={item}
              handleRowClick={handleRowClick}
              activeContextMenu={activeContextMenu}
              contextMenuPos={contextMenuPos}
              handleContextMenu={handleContextMenu}
              getFileIcon={getFileIcon}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              handleCancelUpload={handleCancelUpload}
              handleDeleteFile={handleDeleteFile}
              handleDeleteDirectory={handleDeleteDirectory}
              openRenameModal={openRenameModal}
              BASE_URL={BASE_URL}
            />
          );
        })}
    </div>
  );
}

export default DirectoryList;
