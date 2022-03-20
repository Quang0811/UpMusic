const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const progress = $("#progress");
const playlist = $(".playlist");

const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  songs: [
    {
      name: "My heart stereo",
      singer: "Adam Levine",
      path: "./assets/music/song1.mp3",
      image: "./assets/img/song1.jpg",
    },

    {
      name: "Moment",
      singer: "Lil Wuyn & Be.A",
      path: "./assets/music/song2.mp3",
      image: "./assets/img/song2.jpg",
    },

    {
      name: "If You Said So",
      singer: "Coldzy & Wxrdie",
      path: "./assets/music/song3.mp3",
      image: "./assets/img/song3.jpg",
    },

    {
      name: "LAVIAI",
      singer: "HIEUTHUHAI & Wxrdie",
      path: "./assets/music/song4.mp3",
      image: "./assets/img/song4.jpg",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                      <div class="song ${
                        index === this.currentIndex ? "active" : ""
                      }" data-index = "${index}">
                          <div class="thumb" style="background-image: url('${
                            song.image
                          }')">
                      </div>
                      <div div class="body">
                          <h3 class="title">${song.name}</h3>
                          <p class="author">${song.singer}</p>
                      </div>
                      <div class="option">
                          <i class="fas fa-ellipsis-h"></i>
                      </div>
                      </div>
                      `;
    });

    $(".playlist").innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvent: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, //10s
      iterations: Infinity,
    });

    cdThumbAnimate.pause();

    //Xử lý phóng / to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //Khi bài hát đang play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    //Khi bài hát đang pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //Khi tiến độ bài hát bị thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );

        progress.value = progressPercent;
      }
    };

    //Xử lý khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //Khi bấm nút qua bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Khi bấm nút lùi bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Khi bấm nút chọn ngẫu nhiên bài hát
    randomBtn.onclick = function () {
      if (_this.isRandom) {
        _this.isRandom = false;
        randomBtn.classList.remove("active");
      } else {
        randomBtn.classList.add("active");
        _this.isRandom = true;
      }
    };

    //Qua bài hát khác khi hết bài
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //Xử lý lặp lại bài hát
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }

    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }

    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    //Định nghĩa các thuộc tính cho Object
    this.defineProperties();

    //Lắng nghe / xử lý các sự kiện (Dom events)
    this.handleEvent();

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    //Render playlist
    this.render();
  },
};

app.start();
