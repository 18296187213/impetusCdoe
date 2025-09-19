import { qwen3Service, qwen2CoderService } from '@/utils/requestAI';

/**
 * AI相关接口的封装
 * 提供了调用不同AI模型的便捷方法
 */
export const aiApi = {
    /**
     * 调用Qwen3-30B模型
     * 这是一个通用的大语言模型，适合对话、问答、文本生成等任务
     *
     * @param {string} content 用户输入的内容
     * @param {Object} options 可选的请求参数，用于覆盖默认设置
     * @returns {Promise} AI的响应结果
     */
    callQwen3: function(content, options) {
        // 构建请求数据，合并默认参数和用户自定义参数
        const requestData = {
            model: 'Qwen3-30B-A3B-Instruct-2507', // 指定使用的模型
            messages: [
                {
                    role: 'user', // 标记这是用户的输入
                    content: content, // 用户输入的具体内容
                },
            ],
            temperature: 0.7, // 中等创造性，适合一般对话
            max_tokens: 2000, // 限制回复长度，约1000-2000个中文字符
            stream: false, // 不使用流式响应，一次性返回结果
        };

        // 合并用户自定义参数
        if (options) {
            Object.assign(requestData, options);
        }

        // 调用qwen3服务，发送POST请求到聊天完成接口
        return qwen3Service.post('/chat/completions', requestData);
    },

    /**
     * 调用Qwen2.5-Coder模型
     * 这是专门针对代码生成和编程任务优化的模型
     *
     * @param {string} content 用户输入的内容（通常是编程相关的问题或需求）
     * @param {Object} options 可选的请求参数
     * @returns {Promise} AI的响应结果
     */
    callQwen2Coder: function(content, options) {
        const requestData = {
            model: 'Qwen2.5-Coder', // 指定使用代码生成模型
            messages: [
                {
                    role: 'user',
                    content: content,
                },
            ],
            temperature: 0.3, // 较低的随机性，确保代码的准确性和一致性
            max_tokens: 8000, // 更大的token限制，因为代码可能比较长
            stream: false,
        };

        // 合并用户自定义参数
        if (options) {
            Object.assign(requestData, options);
        }

        // 调用qwen2.5-coder服务
        return qwen2CoderService.post('/chat/completions', requestData);
    },

    /**
     * 通用AI调用方法
     * 根据模型类型自动选择对应的服务进行调用
     *
     * @param {string} modelType 模型类型，'qwen3'用于通用对话，'qwen2-coder'用于代码生成
     * @param {string} content 用户输入内容
     * @param {Object} options 可选参数
     * @returns {Promise} AI响应结果
     */
    callAI: function(modelType, content, options) {
        // 根据模型类型选择对应的调用方法
        if (modelType === 'qwen3') {
            return this.callQwen3(content, options); // 调用通用模型
        }
        return this.callQwen2Coder(content, options); // 调用代码生成模型
    },
};

/**
 * 使用示例：
 *
 * // 1. 基础对话
 * aiApi.callQwen3("你好，请介绍一下自己").then(response => {
 *     console.log(response.choices[0].message.content);
 * });
 *
 * // 2. 代码生成
 * aiApi.callQwen2Coder("用JavaScript写一个冒泡排序函数").then(response => {
 *     console.log(response.choices[0].message.content);
 * });
 *
 * // 3. 自定义参数
 * aiApi.callQwen3("写一首诗", {
 *     temperature: 0.9,  // 提高创造性
 *     max_tokens: 500    // 限制长度
 * }).then(response => {
 *     console.log(response.choices[0].message.content);
 * });
 *
 * // 4. 使用通用方法
 * aiApi.callAI('qwen3', "解释一下人工智能").then(response => {
 *     console.log(response.choices[0].message.content);
 * });
 *
 * // 5. 使用async/await语法
 * async function testAI() {
 *     try {
 *         const response = await aiApi.callQwen3("你好");
 *         console.log(response.choices[0].message.content);
 *     } catch (error) {
 *         console.error('调用失败:', error);
 *     }
 * }
 */
