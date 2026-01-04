# 全屏宽度 HitLine 设置指南

## 设计目标

让 HitLine 占据整个屏幕宽度，分为 3 个 lane，每个 lane 占 1/3 屏幕宽度。

```
┌──────────────────────────────────────────┐
│       Lane 0    │   Lane 1    │  Lane 2  │
│    (Left 1/3)   │ (Center 1/3)│(Right 1/3)│
│                 │             │           │
│     [Note]      │             │  [Note]   │
│        ↓        │      ↓      │     ↓     │
│════════════════════════════════════════════│ ← 全屏 HitLine
└──────────────────────────────────────────┘
```

---

## 方案 A: 扩展现有的 3 个 HitLine（推荐）

### 步骤：

1. **选择 HitLine_Left**

2. **在 Inspector → Screen Transform 中设置**：
   ```
   Anchors Preset: Top Left

   Position:
   X: 200     (屏幕宽度的 1/6，让它居中在左侧 1/3)
   Y: 0       (hitline 的 Y 位置)

   Size:
   X: 400     (屏幕宽度的 1/3，调整以适应你的屏幕)
   Y: 5       (hitline 的厚度，调整到你喜欢的厚度)

   Scale: (1, 1, 1)
   ```

3. **选择 HitLine_Center**

   **在 Inspector → Screen Transform 中设置**：
   ```
   Anchors Preset: Top Center

   Position:
   X: 0       (屏幕中心)
   Y: 0

   Size:
   X: 400     (屏幕宽度的 1/3)
   Y: 5

   Scale: (1, 1, 1)
   ```

4. **选择 HitLine_Right**

   **在 Inspector → Screen Transform 中设置**:
   ```
   Anchors Preset: Top Right

   Position:
   X: -200    (屏幕宽度的 1/6，让它居中在右侧 1/3)
   Y: 0

   Size:
   X: 400     (屏幕宽度的 1/3)
   Y: 5

   Scale: (1, 1, 1)
   ```

5. **调整 Image 组件**：
   - **Stretch Mode**: Stretch
   - **Material**: 你的 HitLine Material
   - **颜色**: 每个 lane 可以用不同颜色

---

## 方案 B: 使用 Anchors 自动拉伸（最灵活）

### 步骤：

1. **选择 HitLine_Left**

   **Screen Transform**:
   ```
   Anchors:
   - Min: (0, 0.5)     ← 左边界，垂直居中
   - Max: (0.333, 0.5) ← 1/3 宽度处

   Offset:
   - Left: 0
   - Right: 0
   - Top: -2.5   (hitline 厚度的一半)
   - Bottom: 2.5 (hitline 厚度的一半)
   ```

2. **选择 HitLine_Center**

   **Screen Transform**:
   ```
   Anchors:
   - Min: (0.333, 0.5)  ← 1/3 处开始
   - Max: (0.666, 0.5)  ← 2/3 处结束

   Offset:
   - Left: 0
   - Right: 0
   - Top: -2.5
   - Bottom: 2.5
   ```

3. **选择 HitLine_Right**

   **Screen Transform**:
   ```
   Anchors:
   - Min: (0.666, 0.5)  ← 2/3 处开始
   - Max: (1.0, 0.5)    ← 右边界

   Offset:
   - Left: 0
   - Right: 0
   - Top: -2.5
   - Bottom: 2.5
   ```

**优点**: 自动适应不同屏幕尺寸

---

## 方案 C: 添加全屏背景层

### 步骤：

1. **创建全屏背景 HitLine**:
   - Canvas → Add New → Image
   - 命名为 "HitLine_Background"

2. **Screen Transform 设置**:
   ```
   Anchors: Stretch Horizontal + Center Vertical

   Left: 0
   Right: 0
   Top: -2.5
   Bottom: 2.5

   (或者使用 Min/Max:)
   Min: (0, 0.5)
   Max: (1, 0.5)
   Offset Top: -2.5
   Offset Bottom: 2.5
   ```

3. **设置颜色**:
   - Base Color: 白色，Alpha 0.3
   - 让它作为背景层

4. **添加分隔线（可选）**:
   - 在 1/3 和 2/3 位置添加两条竖线
   - 用来标记 lane 边界

---

## 调整 Notes 大小（可选）

如果你想让 notes 也变宽来填充 lane：

### 在 NoteSpawner.ts 中:

Notes 的位置已经正确（-8, 0, 8），如果想让它们更宽：

1. **修改 NotePrefab 的 Screen Transform**:
   ```
   Width: 增大到接近 lane 宽度（如 300-350）
   Height: 保持或调整
   ```

2. **或者在 Note.ts 中动态设置宽度**（高级）

---

## 视觉增强建议

### 1. 给每个 Lane 不同的颜色：

```
HitLine_Left Material:
- Base Color: (1, 0.2, 0.2, 0.5)  // 红色半透明

HitLine_Center Material:
- Base Color: (0.2, 1, 0.2, 0.5)  // 绿色半透明

HitLine_Right Material:
- Base Color: (0.2, 0.2, 1, 0.5)  // 蓝色半透明
```

### 2. 添加渐变效果：

创建长条形的渐变纹理（从不透明到透明），应用到 HitLine Material

### 3. 添加分隔线：

在 Canvas 下创建两条竖线：
- Position X: 屏幕宽度的 1/3 和 2/3
- Height: 全屏高度
- Width: 1-2 像素
- Color: 白色，Alpha 0.3

---

## 测试步骤：

1. **按 Play**
2. **检查 HitLine 是否覆盖整个屏幕宽度**
3. **Notes 应该在各自的 lane 内下落**
4. **触摸左侧 1/3 应该检测到 Lane 0**
5. **触摸中间 1/3 应该检测到 Lane 1**
6. **触摸右侧 1/3 应该检测到 Lane 2**

---

## 故障排除：

### HitLine 没有拉伸到全屏：
- 检查 Anchors 设置
- 确保 Stretch Mode 设置为 "Stretch"
- 检查 Parent 对象是否是 Screen Image

### HitLine 位置不对：
- Y Position 应该是 0（或你想要的 hitline 高度）
- 确保使用 Screen Transform，不是普通 Transform

### 3 个 HitLine 有重叠或间隙：
- 调整 Anchors Min/Max 值
- 或者调整 Position X 和 Width 值

---

## 快速测试值（1080p 屏幕）：

```
HitLine_Left:
Position X: 180
Size X: 360
Size Y: 6

HitLine_Center:
Position X: 540
Size X: 360
Size Y: 6

HitLine_Right:
Position X: 900
Size X: 360
Size Y: 6
```

根据你的实际屏幕尺寸调整这些值。
