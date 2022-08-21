
        /**
         *1. Render songs    V
         *2. Scroll top     V
         *3. Play / Pause     V
         *4. CD rotate     V
         *5. Next / Prev     V
         *6. Random     V
         *7. Next / Repeat when ended     V
         *8. Active song     V
         *9. Scroll active song intro view    V
         *10. Play song when click     V

        */
        const $ = document.querySelector.bind(document);
        const $$ = document.querySelectorAll.bind(document);
        
        const PLAYER_STORAGE_KEY = 'F8_PLAYER'

        const cd = $('.cd')
        const heading = $('header h2')
        const cdThumb = $('.cd-thumb')
        const audio = $('#audio')
        const playBtn = $('.btn-toggle-play')
        const player = $('.player')
        const progress = $('#progress')
        const prevBtn = $('.btn-prev')
        const nextBtn = $('.btn-next')
        const randomBtn = $('.btn-random')
        const repeatBtn = $('.btn-repeat')
        const playList = $('.playlist')
        let volume_slider = document.querySelector('.volume_slider');
        const curr_time = document.querySelector('.current-time');
        const total_duration = document.querySelector('.total-duration');
        const app = {      
          isPlaying: false,
          CurrentIndex: 0,
          isRandom: false,
          isRepeat: false, 
          config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
          songs: [
            {
              name: '7 Years',
              singer: 'Lucas Graham',
              path: './assets/mp3/7 Years - Lukas Graham.mp3',
              image: './assets/image/1.jpg'
            },
            {
              name: 'Abcdefu',
              singer: 'GAYLE',
              path: './assets/mp3/Abcdefu-GAYLE-7184408.mp3',
              image:'./assets/image/2.jpg'
            },
            {
              name: 'Attention',
              singer: 'Charlie Puth',
              path:'./assets/mp3/Attention-CharliePuth-6429177.mp3',
              image:'./assets/image/3.jpg'
            },
            {
              name: 'Build A Bitch',
              singer: 'Bella Poarch',
              path: './assets/mp3/BuildABitch-BellaPoarch-7030913.mp3',
              image:'./assets/image/4.jpg'
            },
            {
              name: 'Glimpse Of Us',
              singer: 'Joji',
              path: './assets/mp3/GlimpseOfUs-Joji-7479275.mp3',
              image:'./assets/image/5.jpg'
            },
            {
              name: 'Havana',
              singer: 'Camila Cabello x YoungThug',
              path:'./assets/mp3/Havana-CamilaCabelloYoungThug-5817730.mp3',
              image:'./assets/image/6.png'
            },
            {
              name: 'The River',
              singer: 'Axel Johansson',
              path: './assets/mp3/TheRiver-AxelJohansson-5280558.mp3',
              image:'./assets/image/7.jpg'     
            },
            {
              name: 'Wake Me Up',
              singer: 'Acivii',
              path: './assets/mp3/WakeMeUpAviciiByAvicii-Avicii-3026277.mp3',
              image:'./assets/image/8.jpg'     
            },
            {
              name: 'Santa Claus Is Coming To Town Feat',
              singer: 'Frank Sinatra',
              path: './assets/mp3/SantaClausIsComingToTownFeatFrankSinatra--4168217.mp3',
              image:'./assets/image/9.jpg'     
            },
            {
              name: '2002',
              singer: 'Anne Marie',
              path: './assets/mp3/2002-AnneMarie-6274986.mp3',
              image:'./assets/image/10.jpg'     
            }
          ],
          setconfig: function(key, value) {
            this.config[key] = value;
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
          },
          render: function() {
            const htmls = this.songs.map((song, index) => {
                return `
                    <div class="song ${index === this.CurrentIndex ? 'active' : ''}" data-index='${index}'>
                        <div class="thumb" 
                            style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>
                `
            })
            playList.innerHTML = htmls.join('');
          },
          defineProperties: function() {
            Object.defineProperty(this, 'currentSong', {
              get: function() {
                return this.songs[this.CurrentIndex]
              }
            })
          },

          handleEvents: function() {
            const _this = this
            const cdWidth = cd.offsetWidth

            // Xử lý CD quay / dừng
            const cdThumbAnimate = cdThumb.animate([
                { transform: 'rotate(360deg)'}
            ],{
                duration: 10000, // 10 giây
                iterations: Infinity
            })
            cdThumbAnimate.pause()

            // Xử lí phóng to thu nhỏ CD
            document.onscroll = function() {
              const scrollTop = window.scrollY || document.documentElement.scrollTop
              const newCdWidth = cdWidth - scrollTop
  
              cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
              cd.style.opacity = newCdWidth / cdWidth
            }

            // Xử lí khi click play
            playBtn.onclick = function() {
              if(_this.isPlaying) {
                audio.pause()
              } else {
                audio.play()
              }
            }

            // Khi bài hát play
            audio.onplay = function() {
              _this.isPlaying = true
              player.classList.add('playing')
              cdThumbAnimate.play()

            }

            // Khi bài hát pause
              audio.onpause = function() {
              _this.isPlaying = false
              player.classList.remove('playing')
              cdThumbAnimate.pause()

            }

            // Khi tiến độ bài hát thay đổi
            audio.ontimeupdate = function() {
              if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
              }
            } 

            // Xử lí khi tua bài hát
            progress.onchange = function(e) {
              const seekTime = audio.duration / 100* e.target.value
              audio.currentTime = seekTime
            }

            // Khi next bài hát
            nextBtn.onclick = function() {
              if (_this.isRandom) {
                _this.playRandomSong()
              } else {
                _this.nextSong()
              }
              audio.play()
              _this.render()
              _this.scrollToActiveSong()
            }

            // Khi prev bài hát
            prevBtn.onclick = function() {
              if (_this.isRandom) {
                _this.playRandomSong()
              } else {
                _this.prevSong()
              }
              audio.play() 
              _this.render()

            }

            // Xử lí bật / tắt random 
            randomBtn.onclick = function(e) {
              _this.isRandom = !_this.isRandom
              randomBtn.classList.toggle('active',_this.isRandom)
            }

            // Xử lí khi bài hát kết thúc
            audio.onended = function () {
              if(_this.isRepeat) {
                audio.play()
              }else{
                nextBtn.click()
              }
            }

            // Xử lí lặp lại bài hát
            repeatBtn.onclick = function(e) {
              _this.isRepeat = !_this.isRepeat
              repeatBtn.classList.toggle('active',_this.isRepeat)
            }

            // Lắng nghe hành vi click vào playlist
            playList.onclick = function(e) {
              const songNode = e.target.closest('.song:not(.active)')
              if(songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if(songNode) {
                  _this.CurrentIndex = Number(songNode.dataset.index)
                  _this.loadCurrentSong()
                  _this.render()
                  audio.play()
                }
                // Xử lí khi click vào song option
                if(e.target.closet('.option')){

                }
              }
            }   
          },

          loadCurrentSong: function() {
            heading.textContent = this.currentSong.name
            cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
            audio.src = this.currentSong.path
            this.random_bg_color()
          },

          nextSong: function() {
            this.CurrentIndex++
            if(this.CurrentIndex >= this.songs.length) {
              this.CurrentIndex = 0
            }
            this.loadCurrentSong()
          },

          prevSong: function() {
            this.CurrentIndex--
            if(this.CurrentIndex < 0) {
              this.CurrentIndex = this.songs.length - 1
            }
            this.loadCurrentSong()
          },

          playRandomSong: function() {
            let newIndex
            do{
              newIndex = Math.floor(Math.random() * this.songs.length)
            } while (newIndex === this.CurrentIndex)

            this.CurrentIndex = newIndex
            this.loadCurrentSong()
          },

          scrollToActiveSong: function() {
            setTimeout(() =>{
              $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
              })
            },300)
          },

          random_bg_color: function (){
            let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e'];
            let a;
        
            function populate(a){
                for(let i=0; i<6; i++){
                    let x = Math.round(Math.random() * 14);
                    let y = hex[x];
                    a += y;
                }
                return a;
            }
            let Color1 = populate('#');
            let Color2 = populate('#');
            var angle = 'to right';
        
            let gradient = 'linear-gradient(' + angle + ',' + Color1 + ', ' + Color2 + ")";
            document.body.style.background = gradient;
          },
          
          setVolume: function (){
            audio.volume = volume_slider.value / 100;
          },

          start: function() {
            // Định nghĩa các thuộc tính cho object
            this.defineProperties()

            // Lắng nghe và xử lý các sự kiện (DOM events)
            this.handleEvents()

            // Tải thông tin bài hát đầu tiên và UI khi chạy ứng dụng
            this.loadCurrentSong()
  
            // Render playlist
            this.render()
          }  
        }

        app.start();
      