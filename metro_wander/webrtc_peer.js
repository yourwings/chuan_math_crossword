// WebRTC点对点连接实现

/**
 * WebRTC点对点连接管理类
 * 用于在局域网内实现点对点连接，替代WebSocket服务器
 */
class WebRTCPeerManager {
  constructor() {
    // 连接状态
    this.isConnected = false;
    this.isHost = false;
    this.localPeerId = this.generatePeerId();
    this.localPeerName = '';
    this.roomId = null;
    
    // 连接对象
    this.peerConnections = {}; // 存储与其他对等方的连接 {peerId: {connection, dataChannel}}
    this.dataChannels = {}; // 存储数据通道 {peerId: dataChannel}
    
    // 游戏状态
    this.players = [];
    this.gameStarted = false;
    
    // 回调函数
    this.messageCallbacks = {};
    
    // ICE服务器配置 - 仅用于局域网发现
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // 使用公共STUN服务器
      ]
    };
    
    // 信令数据交换区域 - 在实际应用中可以替换为简单的服务器或其他方式
    this.signalingArea = document.createElement('div');
    this.signalingArea.style.display = 'none';
    document.body.appendChild(this.signalingArea);
    
    // 创建信令输入输出区域
    this.createSignalingUI();
  }
  
  /**
   * 生成唯一的对等方ID
   */
  generatePeerId() {
    return 'peer_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }
  
  /**
   * 创建简单的信令UI，用于手动交换连接信息
   * 在实际应用中可以替换为自动化的信令服务器
   */
  createSignalingUI() {
    // 创建信令UI容器
    const signalingUI = document.createElement('div');
    signalingUI.className = 'signaling-ui';
    signalingUI.style.position = 'fixed';
    signalingUI.style.bottom = '10px';
    signalingUI.style.right = '10px';
    signalingUI.style.backgroundColor = '#f0f0f0';
    signalingUI.style.padding = '10px';
    signalingUI.style.borderRadius = '5px';
    signalingUI.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    signalingUI.style.zIndex = '1000';
    signalingUI.style.display = 'none'; // 默认隐藏
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = 'WebRTC连接';
    title.style.margin = '0 0 10px 0';
    signalingUI.appendChild(title);
    
    // 创建连接ID显示
    const idDisplay = document.createElement('div');
    idDisplay.textContent = `你的连接ID: ${this.localPeerId}`;
    idDisplay.style.marginBottom = '10px';
    idDisplay.style.fontSize = '12px';
    signalingUI.appendChild(idDisplay);
    
    // 创建信令数据输入区域
    const signalingInput = document.createElement('textarea');
    signalingInput.placeholder = '粘贴对方的连接信息...';
    signalingInput.style.width = '100%';
    signalingInput.style.height = '80px';
    signalingInput.style.marginBottom = '10px';
    signalingUI.appendChild(signalingInput);
    
    // 创建连接按钮
    const connectButton = document.createElement('button');
    connectButton.textContent = '连接';
    connectButton.style.padding = '5px 10px';
    connectButton.style.marginRight = '5px';
    connectButton.addEventListener('click', () => {
      const signalingData = signalingInput.value.trim();
      if (signalingData) {
        try {
          const data = JSON.parse(signalingData);
          this.handleSignalingData(data);
          signalingInput.value = '';
        } catch (error) {
          console.error('信令数据格式错误:', error);
          alert('连接信息格式错误，请检查后重试');
        }
      }
    });
    signalingUI.appendChild(connectButton);
    
    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.padding = '5px 10px';
    closeButton.addEventListener('click', () => {
      signalingUI.style.display = 'none';
    });
    signalingUI.appendChild(closeButton);
    
    // 创建信令数据输出区域
    const signalingOutput = document.createElement('div');
    signalingOutput.style.marginTop = '10px';
    signalingOutput.style.display = 'none';
    signalingUI.appendChild(signalingOutput);
    
    // 保存引用
    this.signalingUI = signalingUI;
    this.signalingInput = signalingInput;
    this.signalingOutput = signalingOutput;
    
    // 添加到文档
    document.body.appendChild(signalingUI);
    
    // 创建显示/隐藏信令UI的按钮
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '连接设置';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '10px';
    toggleButton.style.right = '10px';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.zIndex = '999';
    toggleButton.addEventListener('click', () => {
      signalingUI.style.display = signalingUI.style.display === 'none' ? 'block' : 'none';
    });
    document.body.appendChild(toggleButton);
  }
  
  /**
   * 显示信令数据
   */
  displaySignalingData(data) {
    const dataStr = JSON.stringify(data);
    
    // 创建文本区域显示信令数据
    const container = document.createElement('div');
    container.style.marginTop = '10px';
    container.style.marginBottom = '10px';
    container.style.padding = '10px';
    container.style.backgroundColor = '#e8f4fc';
    container.style.borderRadius = '5px';
    
    const title = document.createElement('div');
    title.textContent = '你的连接信息 (发送给对方):';
    title.style.marginBottom = '5px';
    title.style.fontWeight = 'bold';
    container.appendChild(title);
    
    const textarea = document.createElement('textarea');
    textarea.value = dataStr;
    textarea.style.width = '100%';
    textarea.style.height = '80px';
    textarea.style.marginBottom = '5px';
    textarea.readOnly = true;
    container.appendChild(textarea);
    
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制';
    copyButton.style.padding = '3px 8px';
    copyButton.addEventListener('click', () => {
      textarea.select();
      document.execCommand('copy');
      copyButton.textContent = '已复制!';
      setTimeout(() => {
        copyButton.textContent = '复制';
      }, 2000);
    });
    container.appendChild(copyButton);
    
    // 清除之前的内容
    this.signalingOutput.innerHTML = '';
    this.signalingOutput.appendChild(container);
    this.signalingOutput.style.display = 'block';
  }
  
  /**
   * 处理接收到的信令数据
   */
  handleSignalingData(data) {
    if (data.type === 'offer') {
      this.handleOffer(data);
    } else if (data.type === 'answer') {
      this.handleAnswer(data);
    } else if (data.type === 'candidate') {
      this.handleCandidate(data);
    } else {
      console.warn('未知的信令数据类型:', data.type);
    }
  }
  
  /**
   * 初始化WebRTC连接
   */
  async initializeAsHost(playerName) {
    this.isHost = true;
    this.localPeerName = playerName;
    this.roomId = 'room_' + Date.now();
    
    // 添加自己到玩家列表
    this.players.push({
      id: this.localPeerId,
      name: playerName,
      isHost: true,
      isConnected: true
    });
    
    // 触发房间创建回调
    this.triggerCallback('room_created', {
      roomId: this.roomId,
      players: this.players,
      hostId: this.localPeerId
    });
    
    // 不自动显示连接UI，让游戏流程控制UI显示
    // this.signalingUI.style.display = 'block';
    console.log('房间创建成功，ID:', this.roomId);
  }
  
  /**
   * 作为客户端加入连接
   */
  async joinPeer(playerName) {
    this.isHost = false;
    this.localPeerName = playerName;
    
    // 创建与主机的连接
    await this.createPeerConnection(null, playerName);
    
    // 显示连接UI
    this.signalingUI.style.display = 'block';
  }
  
  /**
   * 创建与对等方的连接
   */
  async createPeerConnection(remotePeerId, remotePeerName) {
    try {
      // 创建RTCPeerConnection
      const peerConnection = new RTCPeerConnection(this.iceServers);
      
      // 创建数据通道
      const dataChannel = peerConnection.createDataChannel('gameChannel', {
        ordered: true // 确保消息按顺序到达
      });
      
      // 设置数据通道事件处理
      this.setupDataChannel(dataChannel, remotePeerId);
      
      // 监听ICE候选
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // 发送ICE候选给对等方
          const candidateData = {
            type: 'candidate',
            candidate: event.candidate,
            peerId: this.localPeerId,
            peerName: this.localPeerName,
            targetPeerId: remotePeerId
          };
          
          // 在实际应用中，这里应该通过信令服务器发送
          // 这里我们显示给用户手动交换
          this.displaySignalingData(candidateData);
        }
      };
      
      // 监听连接状态变化
      peerConnection.onconnectionstatechange = () => {
        console.log('连接状态变化:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          console.log('与对等方连接成功!');
          this.isConnected = true;
          
          // 如果是客户端连接到主机
          if (!this.isHost && remotePeerId) {
            // 发送加入房间消息
            this.sendToPeer(remotePeerId, {
              type: 'join_room',
              peerId: this.localPeerId,
              peerName: this.localPeerName
            });
          }
        }
      };
      
      // 监听数据通道
      peerConnection.ondatachannel = (event) => {
        const receivedDataChannel = event.channel;
        this.setupDataChannel(receivedDataChannel, remotePeerId);
      };
      
      // 如果是主动连接，创建offer
      if (!remotePeerId) {
        // 创建offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // 发送offer给对等方
        const offerData = {
          type: 'offer',
          offer: peerConnection.localDescription,
          peerId: this.localPeerId,
          peerName: this.localPeerName
        };
        
        // 在实际应用中，这里应该通过信令服务器发送
        // 这里我们显示给用户手动交换
        this.displaySignalingData(offerData);
      }
      
      // 保存连接
      if (remotePeerId) {
        this.peerConnections[remotePeerId] = peerConnection;
        this.dataChannels[remotePeerId] = dataChannel;
      } else {
        // 临时存储，等收到对方ID后再关联
        this.tempConnection = {
          connection: peerConnection,
          dataChannel: dataChannel
        };
      }
      
      return peerConnection;
    } catch (error) {
      console.error('创建对等连接失败:', error);
      throw error;
    }
  }
  
  /**
   * 设置数据通道事件处理
   */
  setupDataChannel(dataChannel, peerId) {
    dataChannel.onopen = () => {
      console.log('数据通道已打开');
    };
    
    dataChannel.onclose = () => {
      console.log('数据通道已关闭');
    };
    
    dataChannel.onerror = (error) => {
      console.error('数据通道错误:', error);
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('收到消息:', message);
        
        // 处理消息
        this.handlePeerMessage(message, peerId);
      } catch (error) {
        console.error('处理消息错误:', error);
      }
    };
    
    return dataChannel;
  }
  
  /**
   * 处理offer
   */
  async handleOffer(data) {
    try {
      const { offer, peerId, peerName } = data;
      console.log('收到offer:', data);
      
      // 创建对等连接
      const peerConnection = new RTCPeerConnection(this.iceServers);
      
      // 监听ICE候选
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // 发送ICE候选给对等方
          const candidateData = {
            type: 'candidate',
            candidate: event.candidate,
            peerId: this.localPeerId,
            peerName: this.localPeerName,
            targetPeerId: peerId
          };
          
          // 在实际应用中，这里应该通过信令服务器发送
          // 这里我们显示给用户手动交换
          this.displaySignalingData(candidateData);
        }
      };
      
      // 监听连接状态变化
      peerConnection.onconnectionstatechange = () => {
        console.log('连接状态变化:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          console.log('与对等方连接成功!');
          this.isConnected = true;
        }
      };
      
      // 监听数据通道
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        this.setupDataChannel(dataChannel, peerId);
        this.dataChannels[peerId] = dataChannel;
      };
      
      // 设置远程描述
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // 创建应答
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // 发送应答给对等方
      const answerData = {
        type: 'answer',
        answer: peerConnection.localDescription,
        peerId: this.localPeerId,
        peerName: this.localPeerName,
        targetPeerId: peerId
      };
      
      // 在实际应用中，这里应该通过信令服务器发送
      // 这里我们显示给用户手动交换
      this.displaySignalingData(answerData);
      
      // 保存连接
      this.peerConnections[peerId] = peerConnection;
    } catch (error) {
      console.error('处理offer失败:', error);
    }
  }
  
  /**
   * 处理answer
   */
  async handleAnswer(data) {
    try {
      const { answer, peerId, peerName } = data;
      console.log('收到answer:', data);
      
      // 获取对应的连接
      let peerConnection;
      if (this.tempConnection) {
        peerConnection = this.tempConnection.connection;
        this.peerConnections[peerId] = peerConnection;
        this.dataChannels[peerId] = this.tempConnection.dataChannel;
        this.tempConnection = null;
      } else {
        peerConnection = this.peerConnections[peerId];
      }
      
      if (peerConnection) {
        // 设置远程描述
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('设置远程描述成功');
      } else {
        console.error('未找到对应的对等连接');
      }
    } catch (error) {
      console.error('处理answer失败:', error);
    }
  }
  
  /**
   * 处理ICE候选
   */
  async handleCandidate(data) {
    try {
      const { candidate, peerId, targetPeerId } = data;
      console.log('收到ICE候选:', data);
      
      // 检查目标ID是否匹配
      if (targetPeerId && targetPeerId !== this.localPeerId) {
        console.log('ICE候选不是发给我的，忽略');
        return;
      }
      
      // 获取对应的连接
      let peerConnection;
      if (this.tempConnection) {
        peerConnection = this.tempConnection.connection;
        this.peerConnections[peerId] = peerConnection;
        this.dataChannels[peerId] = this.tempConnection.dataChannel;
        this.tempConnection = null;
      } else {
        peerConnection = this.peerConnections[peerId];
      }
      
      if (peerConnection) {
        // 添加ICE候选
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('添加ICE候选成功');
      } else {
        console.error('未找到对应的对等连接');
      }
    } catch (error) {
      console.error('处理ICE候选失败:', error);
    }
  }
  
  /**
   * 处理对等方消息
   */
  handlePeerMessage(message, fromPeerId) {
    console.log('处理对等方消息:', message, '来自:', fromPeerId);
    
    // 根据消息类型处理
    switch (message.type) {
      case 'join_room':
        this.handleJoinRoom(message, fromPeerId);
        break;
      case 'room_joined':
        this.handleRoomJoined(message);
        break;
      case 'player_joined':
        this.handlePlayerJoined(message);
        break;
      case 'start_game':
        this.handleStartGame(message);
        break;
      case 'game_started':
        this.handleGameStarted(message);
        break;
      case 'play_card':
        this.handlePlayCard(message, fromPeerId);
        break;
      case 'card_played':
        this.handleCardPlayed(message);
        break;
      case 'draw_card':
        this.handleDrawCard(message, fromPeerId);
        break;
      case 'card_drawn':
        this.handleCardDrawn(message);
        break;
      case 'end_turn':
        this.handleEndTurn(message, fromPeerId);
        break;
      case 'turn_ended':
        this.handleTurnEnded(message);
        break;
      default:
        console.log('未知消息类型:', message.type);
        // 触发通用回调
        this.triggerCallback(message.type, message);
    }
  }
  
  /**
   * 处理加入房间请求
   */
  handleJoinRoom(message, fromPeerId) {
    if (!this.isHost) return;
    
    const { peerId, peerName } = message;
    
    // 添加玩家到列表
    this.players.push({
      id: peerId,
      name: peerName,
      isHost: false,
      isConnected: true
    });
    
    // 发送房间加入成功消息给新玩家
    this.sendToPeer(fromPeerId, {
      type: 'room_joined',
      roomId: this.roomId,
      players: this.players,
      hostId: this.localPeerId
    });
    
    // 广播新玩家加入消息给其他玩家
    this.broadcastToPeers({
      type: 'player_joined',
      player: {
        id: peerId,
        name: peerName,
        isHost: false
      },
      players: this.players
    }, [fromPeerId]);
    
    // 触发玩家加入回调
    this.triggerCallback('player_joined', {
      player: {
        id: peerId,
        name: peerName,
        isHost: false
      },
      players: this.players
    });
  }
  
  /**
   * 处理房间加入成功消息
   */
  handleRoomJoined(message) {
    const { roomId, players, hostId } = message;
    
    // 更新状态
    this.roomId = roomId;
    this.players = players;
    this.isHost = hostId === this.localPeerId;
    
    // 触发房间加入回调
    this.triggerCallback('room_joined', message);
  }
  
  /**
   * 处理玩家加入消息
   */
  handlePlayerJoined(message) {
    const { player, players } = message;
    
    // 更新玩家列表
    this.players = players;
    
    // 触发玩家加入回调
    this.triggerCallback('player_joined', message);
  }
  
  /**
   * 处理开始游戏请求
   */
  handleStartGame(message, fromPeerId) {
    if (!this.isHost) return;
    
    // 初始化游戏
    const gameState = this.initializeGame();
    
    // 广播游戏开始消息
    this.broadcastToPeers({
      type: 'game_started',
      ...gameState
    });
    
    // 触发游戏开始回调
    this.triggerCallback('game_started', gameState);
  }
  
  /**
   * 初始化游戏
   */
  initializeGame() {
    // 创建牌组
    const deck = this.createDeck();
    
    // 洗牌
    const shuffledDeck = this.shuffleArray(deck);
    
    // 选择第一张桌面牌（地铁站牌）
    let tableCards = [];
    let deckCards = [...shuffledDeck];
    
    // 找到第一张地铁站牌作为起始牌
    for (let i = 0; i < deckCards.length; i++) {
      if (deckCards[i].type === 'station') {
        tableCards.push(deckCards[i]);
        deckCards.splice(i, 1);
        break;
      }
    }
    
    // 为每个玩家发牌
    const playersWithCards = this.players.map(player => {
      const cards = deckCards.splice(0, 5); // 每人5张牌
      return {
        ...player,
        cards: cards
      };
    });
    
    // 确定第一个玩家
    let currentPlayerIndex = 0;
    // 优先选择真人玩家
    for (let i = 0; i < playersWithCards.length; i++) {
      if (!playersWithCards[i].isAI) {
        currentPlayerIndex = i;
        break;
      }
    }
    
    // 更新游戏状态
    this.gameStarted = true;
    this.players = playersWithCards;
    
    return {
      players: playersWithCards,
      tableCards: tableCards,
      deckCards: deckCards,
      currentPlayerId: playersWithCards[currentPlayerIndex].id
    };
  }
  
  /**
   * 处理游戏开始消息
   */
  handleGameStarted(message) {
    // 更新游戏状态
    this.gameStarted = true;
    this.players = message.players;
    
    // 触发游戏开始回调
    this.triggerCallback('game_started', message);
  }
  
  /**
   * 处理出牌请求
   */
  handlePlayCard(message, fromPeerId) {
    if (!this.isHost) return;
    
    const { cards, playMode } = message;
    
    // 验证出牌是否合法（实际游戏中需要更复杂的验证）
    // 这里简化处理
    
    // 更新游戏状态
    // 1. 更新玩家手牌
    const playerIndex = this.players.findIndex(p => p.id === fromPeerId);
    if (playerIndex === -1) return;
    
    const player = this.players[playerIndex];
    
    // 从玩家手牌中移除出的牌
    const updatedCards = player.cards.filter(card => {
      return !cards.some(c => c.id === card.id);
    });
    
    this.players[playerIndex].cards = updatedCards;
    
    // 2. 更新桌面牌
    let tableCards = [...message.tableCards];
    
    // 3. 确定下一个玩家
    let nextPlayerIndex = (playerIndex + 1) % this.players.length;
    const nextPlayerId = this.players[nextPlayerIndex].id;
    
    // 4. 特殊牌效果处理
    let specialEffect = null;
    if (playMode === 'taxi') {
      // 出租车特殊效果：出牌后保持当前玩家回合
      specialEffect = 'taxi';
      // 不更新当前玩家ID，保持当前玩家
    }
    
    // 构建出牌结果消息
    const cardPlayedMessage = {
      type: 'card_played',
      playerId: fromPeerId,
      cards: cards,
      playMode: playMode,
      tableCards: tableCards,
      remainingCards: updatedCards.length,
      currentPlayerId: playMode === 'taxi' ? fromPeerId : nextPlayerId,
      specialEffect: specialEffect
    };
    
    // 广播出牌消息
    this.broadcastToPeers(cardPlayedMessage);
    
    // 触发出牌回调
    this.triggerCallback('card_played', cardPlayedMessage);
    
    // 检查游戏是否结束
    if (updatedCards.length === 0) {
      // 玩家出完所有牌，游戏结束
      const gameOverMessage = {
        type: 'game_over',
        winnerId: fromPeerId,
        winnerName: player.name
      };
      
      // 广播游戏结束消息
      this.broadcastToPeers(gameOverMessage);
      
      // 触发游戏结束回调
      this.triggerCallback('game_over', gameOverMessage);
    }
  }
  
  /**
   * 处理出牌消息
   */
  handleCardPlayed(message) {
    // 触发出牌回调
    this.triggerCallback('card_played', message);
  }
  
  /**
   * 处理摸牌请求
   */
  handleDrawCard(message, fromPeerId) {
    if (!this.isHost) return;
    
    // 从牌堆中抽一张牌
    const card = message.deckCards.shift();
    
    // 更新玩家手牌
    const playerIndex = this.players.findIndex(p => p.id === fromPeerId);
    if (playerIndex === -1) return;
    
    this.players[playerIndex].cards.push(card);
    
    // 发送摸牌结果给请求玩家
    this.sendToPeer(fromPeerId, {
      type: 'card_drawn',
      card: card,
      remainingDeckCount: message.deckCards.length
    });
    
    // 广播玩家摸牌消息给其他玩家
    this.broadcastToPeers({
      type: 'player_drew_card',
      playerId: fromPeerId,
      remainingDeckCount: message.deckCards.length
    }, [fromPeerId]);
    
    // 触发摸牌回调
    this.triggerCallback('player_drew_card', {
      playerId: fromPeerId,
      remainingDeckCount: message.deckCards.length
    });
  }
  
  /**
   * 处理摸牌结果消息
   */
  handleCardDrawn(message) {
    // 触发摸牌回调
    this.triggerCallback('card_drawn', message);
  }
  
  /**
   * 处理结束回合请求
   */
  handleEndTurn(message, fromPeerId) {
    if (!this.isHost) return;
    
    // 确定下一个玩家
    const playerIndex = this.players.findIndex(p => p.id === fromPeerId);
    if (playerIndex === -1) return;
    
    const nextPlayerIndex = (playerIndex + 1) % this.players.length;
    const nextPlayerId = this.players[nextPlayerIndex].id;
    
    // 构建回合结束消息
    const turnEndedMessage = {
      type: 'turn_ended',
      currentPlayerId: nextPlayerId
    };
    
    // 广播回合结束消息
    this.broadcastToPeers(turnEndedMessage);
    
    // 触发回合结束回调
    this.triggerCallback('turn_ended', turnEndedMessage);
  }
  
  /**
   * 处理回合结束消息
   */
  handleTurnEnded(message) {
    // 触发回合结束回调
    this.triggerCallback('turn_ended', message);
  }
  
  /**
   * 创建牌组
   */
  createDeck() {
    // 导入地铁数据
    const metroData = window.metroData || { stations: [] };
    const deck = [];
    
    // 添加地铁站牌 - 使用实际的地铁站数据
    const stationCards = metroData.stations
      .filter(station => station.cardmode === 1)
      .map(station => ({
        id: `station_${station.name}`,
        type: 'station',
        name: station.name,
        lines: station.lines
      }));
    
    // 添加出租车牌（5张）
    const taxiCards = Array(5).fill().map((_, i) => ({
      id: `taxi_${i+1}`,
      type: 'taxi',
      name: '出租车'
    }));
    
    // 添加公交车牌（5张）
    const busCards = Array(5).fill().map((_, i) => ({
      id: `bus_${i+1}`,
      type: 'bus',
      name: '公交车'
    }));
    
    // 合并所有牌并返回
    return [...stationCards, ...taxiCards, ...busCards];
  }
  
  /**
   * 洗牌函数
   */
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  /**
   * 向特定对等方发送消息
   */
  sendToPeer(peerId, data) {
    const dataChannel = this.dataChannels[peerId];
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
  
  /**
   * 向所有对等方广播消息
   */
  broadcastToPeers(data, excludePeerIds = []) {
    let success = false;
    for (const peerId in this.dataChannels) {
      if (excludePeerIds.includes(peerId)) continue;
      if (this.sendToPeer(peerId, data)) {
        success = true;
      }
    }
    return success;
  }
  
  /**
   * 注册消息回调函数
   */
  on(messageType, callback) {
    if (!this.messageCallbacks[messageType]) {
      this.messageCallbacks[messageType] = [];
    }
    this.messageCallbacks[messageType].push(callback);
  }
  
  /**
   * 触发消息回调
   */
  triggerCallback(messageType, data) {
    const callbacks = this.messageCallbacks[messageType];
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`执行${messageType}回调时出错:`, error);
        }
      });
    }
  }
  
  /**
   * 关闭所有连接
   */
  closeAllConnections() {
    // 关闭所有数据通道
    for (const peerId in this.dataChannels) {
      const dataChannel = this.dataChannels[peerId];
      if (dataChannel) {
        dataChannel.close();
      }
    }
    
    // 关闭所有对等连接
    for (const peerId in this.peerConnections) {
      const peerConnection = this.peerConnections[peerId];
      if (peerConnection) {
        peerConnection.close();
      }
    }
    
    // 清空连接对象
    this.peerConnections = {};
    this.dataChannels = {};
    this.isConnected = false;
  }
}

// 导出WebRTCPeerManager类
export default WebRTCPeerManager;