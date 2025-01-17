import React from "react";
import { useRouteMatch } from "react-router";
import useSwr from "swr";
import copyToClipboard from "../utils/copyToClipboard";
import prettyBytes from "../utils/prettyBytes";
import redableTime from "../utils/redableTime";

export default function File() {
  const match = useRouteMatch("/file/:fileId");
  const fileId = match ? match.params.fileId : "";
  const { data, error } = useSwr(`/api/file/${fileId}`, (url) => fetch(url).then((res) => res.json()));
  const copyShareLink = () => copyToClipboard(`${window.location.origin}/file/${fileId}`);

  if (!data && !error) return <div className="loading-div" />;
  if (error) return <h4 style={{ textAlign: "center", color: "red" }}>Cannot find the file</h4>;

  const { id, name, modifiedTime, iconLink, mimeType, size, hasThumbnail, thumbnailLink } = data;
  const copyStreamableLink = () => copyToClipboard(`https://cdn.movies-mca.workers.dev/${name}?id=${id}`);
  const fileLink = `https://in.tobot.workers.dev/${name}?id=${id}`;
  const vlcLink = `vlc://${fileLink}`;
  const mxpLink = `intent:${fileLink}#Intent;package=com.mxtech.videoplayer.ad;S.title=${name};end`;
  const npLink = `nplayer-${fileLink}`;
  
  return (
    <div className="drive-file" id={id}>
      {hasThumbnail && <img className="drive-file-thumb" src={thumbnailLink} alt={name} />}
      <div className="row items-center mt-1 mb-05">
        <img className="drive-item-icon" src={iconLink} alt={mimeType} />
        <h2 className="drive-item-title">{name}</h2>
      </div>
      <h4>Type: {mimeType}</h4>
      <h4>Size: {prettyBytes(size)}</h4>
      <h4>Last modified: {redableTime(modifiedTime)}</h4>
      <div className="row flex-wrap space-evenly mt-1">
        <a href={`/api/file/download/${name}?id=${id}`} className="button primary">
          <span className="btn-icon">
            <ion-icon name="download-outline" />
          </span>
          <span className="btn-text">Download 1</span>
        </a>
        <a href={fileLink} className="button dwnld">
          <span className="btn-icon">
            <ion-icon name="cloud-download-outline" />
          </span>
          <span className="btn-text">Download 2</span>
        </a>
        <a href={vlcLink} className="button vlc">
          <span className="btn-icon">
            <ion-icon name="flame-outline" />
          </span>
          <span className="btn-text">Open in VLC</span>
        </a>
        <a href={mxpLink} className="button mxp" referrerpolicy="same-origin">
          <span className="btn-icon">
            <ion-icon name="play-circle-outline" />
          </span>
          <span className="btn-text">Open in MX Player</span>
        </a>
        <a href={npLink} className="button npl">
          <span className="btn-icon">
            <ion-icon name="shapes-outline" />
          </span>
          <span className="btn-text">Open in nPlayer</span>
        </a>
        <button onClick={copyStreamableLink}>
          <span className="btn-icon">
            <ion-icon name="play-outline" />
          </span>
          <span className="btn-text">Copy streamable link</span>
        </button>
        <button onClick={copyShareLink}>
          <span className="btn-icon">
            <ion-icon name="copy-outline" />
          </span>
          <span className="btn-text">Copy share link</span>
        </button>
      </div>
    </div>
  );
}
