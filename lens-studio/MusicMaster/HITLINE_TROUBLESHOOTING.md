# HitLine 尺寸调整故障排除指南

## 问题：HitLine 调整 Scale 后仍然是正方形

### 原因分析：
1. Image Stretch Mode 设置不正确
2. Material 的纹理是正方形
3. 使用了错误的 Transform 类型

---

## 解决方案 1: 使用 Screen Transform（最推荐）

### 步骤：

1. **检查 HitLine 的层级**：
   ```
   Canvas [Screen Image]
   └── HitLine_Left [Image]  ← 确保在 Screen Image 下
   ```

2. **选择 HitLine_Left**

3. **在 Inspector 中查找 Screen Transform**：
   - 如果没有 Screen Transform，需要重新创建对象
   - Canvas → 右键 → Add New → Image

4. **设置 Screen Transform**：
   ```
   Anchors:  Center
   Pivot:    (0.5, 0.5)
   Position: (-8, 0, 0)  ← 根据左/中/右调整 X
   Size:
     X: 40    ← 宽度（窄）
     Y: 250   ← 高度（长条形）
   Rotation: (0, 0, 0)
   Scale:    (1, 1, 1)   ← 保持为 1
   ```

5. **在 Image 组件中**：
   ```
   Stretch Mode: Stretch
   Material: 你的 Material
   ```

---

## 解决方案 2: 修改 Stretch Mode

### 步骤：

1. **选择 HitLine**

2. **在 Image 组件中**：
   - 找到 **Stretch Mode** 下拉菜单
   - 改为 **"Stretch"**（不是 Fill 或 Fit）

3. **然后调整 Transform Scale**：
   ```
   Position: (-8, 0, 0)
   Rotation: (0, 0, 0)
   Scale:
     X: 0.15   ← 非常窄
     Y: 4.0    ← 非常长
     Z: 1.0
   ```

---

## 解决方案 3: 创建长条形纹理

### 如果上述方法都不行，问题可能是纹理本身：

### 步骤：

1. **创建长条形图片**：
   - 打开任何图像编辑器（Paint、Photoshop、Figma 等）
   - 创建新图片：**50 x 500 像素**
   - 填充白色
   - 导出为 PNG

2. **导入到 Lens Studio**：
   - Assets Panel → + → Import Files
   - 选择你创建的长条形图片

3. **创建新 Material**：
   - Assets Panel → 右键 → Add New → Material
   - 命名为 "HitLine_Material"
   - Material Type: **Unlit**
   - Base Texture: 拖入你的长条形图片

4. **应用到 HitLine**：
   - 选择 HitLine
   - Image → Material → 选择 "HitLine_Material"

5. **调整颜色和透明度**：
   - 在 Material 设置中调整 Base Color
   - Alpha 设置为 0.5（半透明）

---

## 解决方案 4: 使用 2D Sprite 替代 Image

### 如果 Image 组件不适合，可以使用 Sprite：

1. **删除当前的 HitLine Image**

2. **创建新的 Sprite Object**：
   - Canvas → Add New → 2D Object → Sprite

3. **配置 Sprite**：
   ```
   Transform Position: (-8, 0, 0)
   Transform Scale: (0.2, 4.0, 1.0)
   Sprite Material: 你的长条形 Material
   ```

---

## 验证步骤：

完成上述任何一个解决方案后：

1. **在 Preview 中检查**：
   - 应该看到 3 条竖直的长条
   - 不是正方形

2. **如果还是正方形**：
   - 截图发给我，包括：
     - Inspector 面板（显示所有组件和参数）
     - Scene 视图
     - Objects 层级面板

---

## 快速参考：

### 理想的 HitLine 设置（Screen Transform 方式）：

```
Object: HitLine_Left
Parent: Canvas [Screen Image]

Components:
├── Screen Transform
│   ├── Anchors: Center
│   ├── Size: (40, 250)
│   ├── Position: (-8, 0, 0)
│   └── Scale: (1, 1, 1)
│
├── Image
│   ├── Stretch Mode: Stretch
│   └── Material: HitLine_Material
│
└── Script Component
    └── HitLineFeedback.ts
```

### 理想的 Material 设置：

```
Material: HitLine_Material
├── Type: Unlit
├── Base Texture: (optional, 或长条形图片)
├── Base Color: (1, 1, 1, 0.5) 白色半透明
└── Blend Mode: Alpha (for transparency)
```

---

## 常见错误：

❌ **错误 1**: Stretch Mode 设置为 "Fill"
✅ **正确**: Stretch Mode 设置为 "Stretch"

❌ **错误 2**: 调整 Transform Scale，但没有 Screen Transform
✅ **正确**: 使用 Screen Transform 的 Size 参数

❌ **错误 3**: Material 的纹理是正方形图片
✅ **正确**: 使用长条形纹理或无纹理纯色

---

## 如果还是不行：

1. 检查 Image 组件的参数
2. 尝试重新创建 HitLine 对象
3. 确保它是 Screen Image 的直接子对象
4. 截图并发送给我详细的设置
