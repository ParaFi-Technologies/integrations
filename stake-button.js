(function() {
    // Pre-load connection and constants
    let connection;
    let solanaWeb3Script;
    let voteAccount;
    
    // Initialize essentials immediately
    function initialize() {
        // Load Solana Web3.js in parallel with other operations
        solanaWeb3Script = document.createElement('script');
        solanaWeb3Script.src = "https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js";
        solanaWeb3Script.onload = () => {
            // Initialize constants that depend on solanaWeb3
            voteAccount = new solanaWeb3.PublicKey("pt1LsjkNwqCKdYYfc35ToDkqtEG9pswLTJNaMo8inft");
            connection = new solanaWeb3.Connection(
                "YOUR_RPC_URL",
                'confirmed'
            );
        };
        document.head.appendChild(solanaWeb3Script);
    }

    // Initialize early
    initialize();

    class ParafiStakeButton extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({mode: 'open'});
            
            shadow.innerHTML = `
                <style>
                    .parafi-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    }
                    .parafi-stake-button {
                        background: linear-gradient(45deg, #144C2A, #144C2A);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        font-family: -apple-system, system-ui, BlinkMacSystemFont;
                        padding: 12px 24px;
                        transition: all 0.2s ease;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        line-height: 1.2;
                        width: 200px;
                        height: 64px;
                        box-sizing: border-box;
                    }
                    .parafi-stake-button:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .parafi-stake-button .main-text {
                        font-size: 16px;
                        font-weight: 500;
                        text-align: center;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    .parafi-stake-button .sub-text {
                        font-size: 12px;
                        font-weight: 400;
                        opacity: 0.9;
                        text-align: center;
                        width: 100%;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .spinner {
                        animation: spin 1s linear infinite;
                        width: 16px;
                        height: 16px;
                    }
                    .checkmark {
                        width: 16px;
                        height: 16px;
                    }
                    .input-container {
                        display: none;
                        width: 100%;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                        position: relative;
                        margin-bottom: 4px;
                    }
                    
                    .stake-input {
                        width: 120px;
                        padding: 4px 8px;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        background: #f5f5f5;
                        color: #333;
                        text-align: center;
                        height: 24px;
                        box-sizing: border-box;
                    }
                    
                    .send-icon {
                        cursor: pointer;
                        width: 20px;
                        height: 24px;
                        color: #144C2A;
                        background: #f5f5f5;
                        padding: 0 6px;
                        border-radius: 4px;
                        margin-left: 4px;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        font-weight: bold;
                        box-sizing: border-box;
                    }
                    
                    .send-icon:hover {
                        background: #e0e0e0;
                        transform: translateX(1px);
                    }
                    
                    .stake-input::placeholder {
                        color: #888;
                    }
                </style>
                <div class="parafi-container">
                    <button class="parafi-stake-button">
                        <span class="main-text">Stake</span>
                        <div class="input-container">
                            <input type="number" class="stake-input" placeholder="0.1" min="0" step="0.1">
                            <div class="send-icon">→</div>
                        </div>
                        <span class="sub-text">powered by ParaFi Tech</span>
                    </button>
                </div>
            `;
            
            this.button = shadow.querySelector('.parafi-stake-button');
            this.mainText = shadow.querySelector('.main-text');
            this.subText = shadow.querySelector('.sub-text');
            this.inputContainer = shadow.querySelector('.input-container');
            this.stakeInput = shadow.querySelector('.stake-input');
            this.sendIcon = shadow.querySelector('.send-icon');
            
            this.button.addEventListener('click', this.handleButtonClick.bind(this));
            this.sendIcon.addEventListener('click', this.handleSend.bind(this));
            this.isInputMode = false;
        }

        updateButtonText(main, sub, icon = null) {
            // Clear existing content
            this.mainText.innerHTML = '';
            
            // Add icon if provided
            if (icon) {
                this.mainText.innerHTML += icon;
            }
            
            // Add text
            this.mainText.innerHTML += main;
            this.subText.textContent = sub;
        }

        getSpinnerIcon() {
            return `
                <svg class="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="32" stroke-linecap="round"/>
                </svg>
            `;
        }

        getCheckmarkIcon() {
            return `
                <svg class="checkmark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }

        getProvider() {
            if ('phantom' in window && window.phantom?.solana?.isPhantom) {
                return window.phantom.solana;
            }
            window.open('https://phantom.app/', '_blank');
            return null;
        }

        async handleButtonClick(e) {
            if (!this.isInputMode) {
                e.preventDefault();
                this.isInputMode = true;
                this.mainText.style.display = 'none';
                this.inputContainer.style.display = 'flex';
                this.subText.textContent = 'Input amount to stake';
                this.stakeInput.focus();
            }
        }

        async handleSend(e) {
            e.stopPropagation(); // Prevent button click handler
            this.isInputMode = false;
            this.inputContainer.style.display = 'none';
            this.mainText.style.display = 'block';
            await this.handleClick(); // Call the existing transaction handler
        }

        async handleClick() {
            try {
                // Reset button to initial state after transaction
                const resetButton = () => {
                    this.mainText.style.display = 'block';
                    this.inputContainer.style.display = 'none';
                    this.subText.textContent = 'powered by ParaFi Tech';
                };

                if (!window.solanaWeb3 || !connection || !voteAccount) {
                    console.error('Web3 not initialized');
                    this.updateButtonText('Error', 'Please try again');
                    return;
                }

                const provider = this.getProvider();
                if (!provider) {
                    console.error('Phantom wallet not found');
                    this.updateButtonText('Error', 'No wallet found');
                    return;
                }

                this.updateButtonText('Connecting', 'to Phantom', this.getSpinnerIcon());
                await provider.connect();

                this.updateButtonText('Creating', 'stake account', this.getSpinnerIcon());
                const wallet = provider.publicKey;
                const stakeAccount = solanaWeb3.Keypair.generate();
                const transaction = new solanaWeb3.Transaction();

                const stakeAmount = parseFloat(this.stakeInput.value) || 0.1;
                transaction.add(solanaWeb3.StakeProgram.createAccount({
                    fromPubkey: wallet,
                    stakePubkey: stakeAccount.publicKey,
                    authorized: {
                        staker: wallet,
                        withdrawer: wallet
                    },
                    lamports: stakeAmount * solanaWeb3.LAMPORTS_PER_SOL
                }));

                transaction.add(solanaWeb3.StakeProgram.delegate({
                    stakePubkey: stakeAccount.publicKey,
                    authorizedPubkey: wallet,
                    votePubkey: voteAccount
                }));

                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = wallet;
                
                this.updateButtonText('Waiting', 'for approval', this.getSpinnerIcon());
                
                // First sign with the stake account
                transaction.sign(stakeAccount);
                
                // Then get user signature through Phantom
                const signed = await provider.signTransaction(transaction);

                this.updateButtonText('Sending', 'transaction', this.getSpinnerIcon());
                const signature = await connection.sendRawTransaction(signed.serialize());

                this.updateButtonText('Confirming', 'transaction', this.getSpinnerIcon());
                
                // Modified confirmation strategy
                const confirmation = await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                }, 'confirmed');

                if (confirmation.value.err) {
                    throw new Error('Transaction failed: ' + confirmation.value.err);
                }

                this.updateButtonText('Success!', 'Stake complete', this.getCheckmarkIcon());

                setTimeout(() => {
                    this.updateButtonText('Stake', 'powered by ParaFi Tech');
                }, 7000);

            } catch (error) {
                console.error('Error:', error);
                this.updateButtonText('Error', error.message || 'Transaction failed');
                setTimeout(() => {
                    this.updateButtonText('Stake', 'powered by ParaFi Tech');
                }, 7000);
            }
        }
    }

    customElements.define('parafi-stake-button', ParafiStakeButton);
})(); 