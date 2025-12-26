import React, { useState } from "react";
import "./ViewerSettings.css";

const ViewerSettings = ({ config, setConfig }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Hàm tiện ích để cập nhật từng thông số
  const update = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="viewer-settings-container">
      {/* Nút Bánh Răng (Toggle) */}
      <button
        className={`btn-toggle-settings ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Cài đặt hiển thị"
      >
        <i className="bi bi-sliders"></i>
      </button>

      {/* Bảng Menu Trượt Ra */}
      {isOpen && (
        <div className="settings-panel">
          <div className="panel-header">
            <h4>CẤU HÌNH 3D</h4>
            <button className="btn-close-panel" onClick={() => setIsOpen(false)}>
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="panel-body">
            {/* --- NHÓM 1: HIỆU NĂNG --- */}
            <div className="setting-group">
              <div className="group-title">
                <i className="bi bi-cpu"></i> Hiệu năng
              </div>
              
              <div className="control-row">
                <label>Bóng đổ</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.shadows}
                    onChange={(e) => update("shadows", e.target.checked)}
                  />
                  <span className="slider"></span>
                </div>
              </div>

              <div className="control-row column">
                <div className="label-flex">
                  <label>Độ nét (DPR)</label>
                  <span className="badge">{config.dpr}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={config.dpr}
                  onChange={(e) => update("dpr", parseFloat(e.target.value))}
                  className="custom-range"
                />
                <div className="range-helper">
                  <span>Mượt</span>
                  <span>Nét</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* --- NHÓM 2: ÁNH SÁNG --- */}
            <div className="setting-group">
              <div className="group-title">
                <i className="bi bi-sun"></i> Ánh sáng & Mặt trời
              </div>

              <div className="control-row column">
                <div className="label-flex">
                  <label>Cường độ nắng</label>
                  <span className="badge">{config.lightIntensity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={config.lightIntensity}
                  onChange={(e) => update("lightIntensity", parseFloat(e.target.value))}
                  className="custom-range"
                />
              </div>

              <div className="control-row column">
                <div className="label-flex">
                  <label>Vị trí Mặt trời (X)</label>
                  <span className="badge">{config.sunX}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={config.sunX}
                  onChange={(e) => update("sunX", parseFloat(e.target.value))}
                  className="custom-range"
                />
              </div>

              <div className="control-row column">
                <div className="label-flex">
                  <label>Độ cao Mặt trời (Y)</label>
                  <span className="badge">{config.sunY}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={config.sunY}
                  onChange={(e) => update("sunY", parseFloat(e.target.value))}
                  className="custom-range"
                />
              </div>
            </div>

            <div className="divider"></div>

            {/* --- NHÓM 3: MÔI TRƯỜNG --- */}
            <div className="setting-group">
              <div className="group-title">
                <i className="bi bi-images"></i> Môi trường
              </div>
              <div className="control-row column">
                <div className="label-flex">
                  <label>Độ mờ hậu cảnh</label>
                  <span className="badge">{config.envBlur}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.envBlur}
                  onChange={(e) => update("envBlur", parseFloat(e.target.value))}
                  className="custom-range"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerSettings;