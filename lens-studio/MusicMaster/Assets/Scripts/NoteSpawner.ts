import { Conductor } from "./Conductor";
import { SongData } from "./TestSongData";
import { Note } from "./Note";

@component
export class NoteSpawner extends BaseScriptComponent {
    // --- 核心依赖 ---
    @input
    conductor: Conductor;

    @input
    notePrefab: Asset; // 记得这里要选 Asset 类型

    // --- 模式选择 ---
    @input
    infiniteMode: boolean = false; // 默认为 false (使用 JSON 模式)

    // --- JSON 模式参数 ---
    @input
    songDataAsset: Asset; // 拖入 .txt 谱面文件

    // --- Infinite 模式参数 ---
    @input
    spawnInterval: number = 1.0; // 随机生成的间隔拍数

    // --- 内部状态 ---
    private pool: SceneObject[] = [];
    private poolSize: number = 30;
    
    // JSON 模式队列
    private notesQueue: any[] = [];
    
    // Infinite 模式计时器
    private nextSpawnBeat: number = 0;

    onAwake() {
        if (!this.notePrefab || !this.conductor) {
            print("❌ Error: 请检查 NotePrefab 和 Conductor 是否分配！");
            return;
        }

        this.initPool();

        if (this.infiniteMode) {
            // A. 如果是无限模式：初始化起始时间
            print("🚀 启动模式: 无限随机生成 (Infinite Mode)");
            this.nextSpawnBeat = this.conductor.currentBeat + 2.0;
        } else {
            // B. 如果是谱面模式
            print("📂 启动模式: 读取 谱面");
            // this.parseSongData();
            this.loadStaticData();
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    private onUpdate() {
        if (!this.conductor) return;
        
        const currentBeat = this.conductor.currentBeat;
        const spawnWindow = 8.0; // 提前生成窗口 (让音符飞一会儿)

        // --- 分支逻辑 ---
        if (this.infiniteMode) {
            // === 逻辑 A: 无限模式 ===
            if (currentBeat + spawnWindow > this.nextSpawnBeat) {
                // 随机轨道 (-1, 0, 1)
                const randomLane = Math.floor(Math.random() * 3) - 1;
                this.spawnNote(this.nextSpawnBeat, randomLane);
                
                // 累加时间
                this.nextSpawnBeat += this.spawnInterval;
            }
        } else {
            // === 逻辑 B: JSON 谱面模式 ===
            // 检查队列里还有没有音符
            if (this.notesQueue.length > 0) {
                // Peek 一下队首音符的时间
                if (this.notesQueue[0].beat < currentBeat + spawnWindow) {
                    // 取出并生成
                    const noteData = this.notesQueue.shift();
                    
                    // 兼容 JSON 里的 lane 定义 (假设 JSON 里 lane 是 0,1,2，转为 -1,0,1)
                    // 如果你的 JSON lane 已经是 -1,0,1 则不需要 -1
                    const laneIndex = (noteData.lane !== undefined) ? (noteData.lane - 1) : 0;
                    
                    this.spawnNote(noteData.beat, laneIndex);
                }
            }
        }
    }

    // --- 统一生成函数 (DRY原则) ---
    private spawnNote(beat: number, lane: number) {
        const noteObj = this.pool.find(obj => !obj.enabled);
        
        if (noteObj) {
            noteObj.enabled = true;
            
            // 获取 Note 脚本组件
            // 使用字符串索引方式访问，最稳妥
            const noteScript = noteObj.getComponent("Component.ScriptComponent");
            if (noteScript) {
                noteScript["targetBeat"] = beat;
                noteScript["conductor"] = this.conductor;
                
                // 计算 X 轴位置 (假设轨道间距为 8)
                const xPos = lane * 8.0;
                
                // 重置位置: X由轨道决定, Y设为高空(100), Z固定为0
                // Y轴会在 Note.ts 的 Update 中立即被覆盖，所以这里初始值给多少都行
                noteObj.getTransform().setLocalPosition(new vec3(xPos, 100, 0));
            }
        }
    }

    private initPool() {
        // 使用 as any 强制转换，配合 instantiate
        const prefab = this.notePrefab as any;
        for (let i = 0; i < this.poolSize; i++) {
            const instance = prefab.instantiate(this.getSceneObject());
            instance.enabled = false;
            this.pool.push(instance);
        }
    }


    private loadStaticData() {
        // 直接赋值，无需解析
        this.notesQueue = [...SongData.notes]; // 使用 ... 复制一份，防止修改原数据
        
        // 同步 BPM
        if (this.conductor) {
            this.conductor.bpm = SongData.bpm;
            this.conductor.offset = SongData.offset;
        }
        
        print("✅ 谱面加载成功！音符数: " + this.notesQueue.length);
    }

    // private parseSongData() {
    //     if (!this.songDataAsset) {
    //         print("⚠️ 警告: 未分配 SongDataAsset，且未开启 InfiniteMode。将不会生成音符。");
    //         return;
    //     }

    //     try {
    //         // 健壮的 Text 读取方式
    //         const jsonStr = this.songDataAsset;
    //         this.inspectAsset(jsonStr);
    //         const json = JSON.parse(jsonStr.toString());
            
    //         if (json.notes) {
    //             this.notesQueue = json.notes;
    //             print("✅ 谱面解析成功，加载了 " + this.notesQueue.length + " 个音符");
    //         }

    //         // 同步 BPM
    //         if (this.conductor && json.bpm) {
    //             this.conductor.bpm = json.bpm;
    //             this.conductor.offset = json.offset || 0;
    //         }
    //     } catch (e) {
    //         print("❌ JSON 解析失败: " + e);
    //     }
    // }

    private inspectAsset(obj: any) {
    print("----- 🕵️‍♂️ 侦探模式启动 -----");
    
    // 1. 检查是不是空
    if (!obj) {
        print("❌ 结果: 对象是 null 或 undefined");
        return;
    }

    // 2. 获取真实的类名 (最关键的一步)
    // 这会告诉你它是 'TextAsset', 'JsonAsset' 还是 'Asset'
    if (obj.constructor) {
        print("🏷️ 真实类型 (Class Name): " + obj.constructor.name);
    }

    // 3. 暴力探测它有什么属性
    // 看看它到底藏着 .text 还是 .json
    print("🔍 属性探测:");
    print("   - has .text? " + (obj.text !== undefined));
    print("   - has .json? " + (obj.json !== undefined));
    
    // 4. 尝试打印内容前 50 个字符
    if (obj.text) {
        print("📄 .text 内容预览: " + obj.text.toString().substring(0, 50) + "...");
    }
    
    if (obj.json) {
        print("📦 .json 对象预览: " + JSON.stringify(obj.json).substring(0, 50) + "...");
    }
    
    print("----------------------------");
}
}