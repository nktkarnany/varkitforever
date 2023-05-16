window.addEventListener("DOMContentLoaded", () => {
  const CLIENT_WIDTH =
    window.innerWidth || document.documentElement.clientWidth;
  const CLIENT_HEIGHT =
    window.innerHeight || document.documentElement.clientHeight;

  const container = document.querySelector(".container");

  // Animation Variable
  let animation;

  // Reasonable defaults
  const PIXEL_STEP = 10;
  const LINE_HEIGHT = 40;
  const PAGE_HEIGHT = 800;
  const IDLE_SPEED = 0.5;
  const SCALE_FACTOR = 0.6;
  const POSITION_BUFFER = 30;

  // Wheel event variables
  let marker = true,
    delta,
    direction,
    interval = 50,
    counter1 = 0,
    counter2,
    event;

  let isMobile = false;

  // Mouse event variables
  let oldMouseX = 0,
    mouseX = 0;
  let oldMouseY = 0,
    mouseY = 0;
  let isMouseMoving = false;
  let isMouseOver = null;

  // setInterval(() => {
  //   if (oldMouseX != mouseX) isMouseMoving = true;
  //   else if (oldMouseY != mouseY) isMouseMoving = true;
  //   else isMouseMoving = false;
  //   oldMouseX = mouseX;
  //   oldMouseY = mouseY;
  // }, 300);

  const images = [];

  const initLoad = [
    {
      position: -CLIENT_HEIGHT,
      imgs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      position: -CLIENT_HEIGHT * 1.5,
      imgs: [7, 8, 9, 10, 11, 12, 13],
    },
    {
      position: -CLIENT_HEIGHT * 2,
      imgs: [11, 12, 13, 14, 15, 16, 17, 18],
    },
    {
      position: -CLIENT_HEIGHT * 2.5,
      imgs: [16, 17, 18, 19, 20, 21, 22, 23],
    },
    {
      position: -CLIENT_HEIGHT * 3.1,
      imgs: [21, 22, 23, 24, 25, 26, 27, 28],
    },
    {
      position: -CLIENT_HEIGHT * 3.7,
      imgs: [26, 27, 28, 29, 30, 31],
    },
    {
      position: -CLIENT_HEIGHT * 4.2,
      imgs: [30, 31, 32, 33, 34, 35, 36],
    },
    {
      position: -CLIENT_HEIGHT * 4.6,
      imgs: [32, 33, 34, 35, 36, 37, 38, 39],
    },
    {
      position: -CLIENT_HEIGHT * 5.1,
      imgs: [37, 38, 39, 40, 41, 42, 43, 44],
    },
    {
      position: -CLIENT_HEIGHT * 5.7,
      imgs: [42, 43, 44, 45, 46, 47, 48, 49],
    },
    {
      position: -CLIENT_HEIGHT * 6,
      imgs: [45, 46, 47, 48, 49, 50, 51, 52],
    },
    {
      position: -CLIENT_HEIGHT * 6.3,
      imgs: [48, 49, 50, 51, 52, 53, 54],
    },
  ];

  const randLoad = getRandomInt(initLoad.length);

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  initLoad[randLoad].imgs = initLoad[randLoad].imgs.map((i) => {
    return `images/${i}.JPG`;
  });

  class Box {
    constructor(colStart, colSpan, rowStart, rowSpan) {
      this.DOM = {
        box: this.box(colStart, colSpan, rowStart, rowSpan),
        boxInner: this.boxInner(colSpan, rowSpan),
      };

      this.DOM.box.appendChild(this.DOM.boxInner);

      container.appendChild(this.DOM.box);
    }
    box(colStart, colSpan, rowStart, rowSpan) {
      const boxEle = document.createElement("div");
      boxEle.classList.add("box");
      boxEle.setAttribute(
        "style",
        `grid-area: ${rowStart} / ${colStart} / span ${rowSpan} / span ${colSpan};`
      );

      return boxEle;
    }
    boxInner(colSpan, rowSpan) {
      const boxInnerEle = document.createElement("div");
      boxInnerEle.classList.add("box-inner");
      boxInnerEle.setAttribute(
        "style",
        `grid-template-columns: repeat(${colSpan * 2}, 1fr);
        grid-template-rows: repeat(${rowSpan * 2}, 1fr);`
      );

      return boxInnerEle;
    }
    addImage(img) {
      this.DOM.boxInner.appendChild(img);
    }
    removeImage(img) {
      if (this.checkParent(img)) this.DOM.boxInner.removeChild(img);
    }
    checkParent(img) {
      if (this.DOM.boxInner.contains(img)) return true;
      return false;
    }
    getBox() {
      return this.DOM.box;
    }
  }

  class Img {
    constructor(colStart, colSpan, rowStart, rowSpan, imageNo, zIndex) {
      const curr = this;

      this.imageNo = imageNo;

      this.zIndex = zIndex;

      this.imgSrc = `images/${imageNo}.JPG`;

      this.DOM = {
        imgContainer: this.imageContainer(
          colStart,
          colSpan,
          rowStart,
          rowSpan,
          imageNo
        ),
        img: this.image(),
      };

      this.DOM.imgContainer.appendChild(this.DOM.img);

      this.DOM.imgContainer.addEventListener("mouseenter", () => curr.over());

      this.DOM.imgContainer.addEventListener("mouseleave", () => curr.out());
    }

    // Initialising Variables
    init() {
      this.startLocation = CLIENT_HEIGHT;
      this.buffer = POSITION_BUFFER;
      this.endLocation = this.startLocation;
      this.speed = 0;
      this.position = initLoad[randLoad].position;
      this.hasSpeed = false;
    }

    // Creating the image container
    imageContainer(colStart, colSpan, rowStart, rowSpan, i) {
      const imgContainerEle = document.createElement("div");
      imgContainerEle.classList.add(`img-container`);
      imgContainerEle.setAttribute(
        "style",
        `grid-area: ${rowStart} / ${colStart} / span ${rowSpan} / span ${colSpan}; z-index: ${this.zIndex};`
      );

      return imgContainerEle;
    }

    // Creating an img element
    image() {
      const imgEle = document.createElement("img");
      imgEle.setAttribute("src", this.imgSrc);
      return imgEle;
    }

    // Get image element
    getImage() {
      return this.DOM.imgContainer;
    }

    // Is the element visible in the viewport, check the dataset
    isVisible() {
      return this.DOM.imgContainer.dataset.visible == 1;
    }

    // Set the position from top
    setTop(t) {
      TweenMax.to(this.DOM.imgContainer, 0, {
        y: t,
        ease: Linear.easeNone,
      });
      this.removeBlur();
    }

    // Checking if image container box collides with mouse pointer
    doesMouseCollide() {
      const { top, left, right, bottom } =
        this.DOM.imgContainer.getBoundingClientRect();
      return mouseX > left && mouseX < right && mouseY < bottom && mouseY > top;
    }

    // Mouse Over Function
    over() {
      if (this.hasSpeed) return;
      isMouseOver = this.imageNo;
      mouseOver();
    }

    // Mouse Out Function
    out() {
      if (this.hasSpeed) return;
      isMouseOver = null;
      mouseOut();
    }

    addBlur() {
      if (isMouseOver != this.imageNo) {
        TweenMax.to(this.DOM.imgContainer, 0.5, {
          filter: "blur(5px)",
          ease: Power3.easeOut,
        });
      }
    }

    removeBlur() {
      TweenMax.to(this.DOM.imgContainer, 0.1, {
        filter: "blur(0px)",
        ease: Power0.easeOut,
      });
    }

    // Change the speed of image
    changeSpeed(speed) {
      this.hasSpeed = false;
      if (speed != 0) {
        this.buffer = 0;
        this.hasSpeed = true;
      }
      if (speed == 0 && !this.isVisible()) this.buffer = POSITION_BUFFER;
      this.speed = speed;
    }

    // Animate each frame at 60fps
    animate() {
      this.position -= IDLE_SPEED + this.speed;

      this.upperThreshold = container.clientHeight;

      if (this.imageNo > 44) {
        this.upperThreshold = container.clientHeight + CLIENT_HEIGHT;
      }

      if (Math.abs(this.position) > this.upperThreshold) {
        this.position = 0;

        if (this.imageNo > 44) {
          this.position = 0 - CLIENT_HEIGHT;
        }
      }

      if (this.speed < 0) {
        this.upperThreshold = 0;

        // if (this.imageNo > 44) {
        //   this.upperThreshold = - CLIENT_HEIGHT;
        // }

        if (this.position > this.upperThreshold) {
          this.position = 0 - container.clientHeight;

          // if (this.imageNo > 44) {
          //   this.position = 0 - container.clientHeight + CLIENT_HEIGHT;
          // }
        }
      }

      if (this.isVisible() && this.buffer > 0) {
        this.buffer -= 4 * this.easing(this.buffer / POSITION_BUFFER);
      }

      this.endLocation = this.startLocation + this.buffer + this.position;
      this.setTop(this.endLocation);
    }

    // Easing function for acceleration until halfway, then deceleration
    easing(progress) {
      return progress < 0.5
        ? 4 * progress * progress * progress
        : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
    }
  }

  const mobileMediaQuery = window.matchMedia(
    "(min-device-width : 320px) and (max-device-width : 480px)"
  );

  function checkSize(e) {
    if (e.matches) {
      isMobile = true;
    }
  }

  checkSize(mobileMediaQuery);

  let sections;

  if (isMobile) {
    sections = [
      {
        box: new Box(3, 21, 5, 17), // Box Params: Col Start, Col Span, Row Start, Row Span
        imgs: [
          new Img(1, 26, 2, 23, 1, 1), // Img Params: Col Start, Col Span, Row Start, Row Span, Img Src, Speed, Z-Index
          new Img(23, 20, 18, 16, 2, 2),
        ],
      },
      {
        box: new Box(2, 23, 26, 23),
        imgs: [
          new Img(1, 20, 16, 10, 3, 1),
          new Img(10, 19, 2, 12, 4, 1),
          new Img(25, 21, 22, 16, 5, 1),
          new Img(7, 16, 34, 12, 6, 1),
        ],
      },
      {
        box: new Box(2, 22, 56, 16),
        imgs: [
          new Img(21, 18, 2, 10, 7, 2),
          new Img(1, 23, 8, 12, 8, 1),
          new Img(19, 26, 21, 12, 9, 1),
        ],
      },
      {
        box: new Box(4, 11, 79, 10),
        imgs: [new Img(1, 21, 2, 19, 10, 1)],
      },
      {
        box: new Box(2, 21, 93, 14),
        imgs: [new Img(14, 27, 1, 12, 13, 1), new Img(1, 33, 11, 17, 14, 1)],
      },
      {
        box: new Box(15, 9, 108, 6),
        imgs: [new Img(2, 17, 1, 11, 15, 1)],
      },
      {
        box: new Box(2, 20, 119, 9),
        imgs: [new Img(1, 19, 4, 15, 11, 1), new Img(23, 15, 2, 14, 12, 1)],
      },
      {
        box: new Box(4, 20, 135, 23),
        imgs: [
          new Img(2, 21, 2, 14, 17, 1),
          new Img(18, 23, 18, 16, 16, 1),
          new Img(6, 18, 32, 16, 18, 1),
        ],
      },
      {
        box: new Box(2, 22, 166, 12),
        imgs: [new Img(1, 22, 2, 12, 19, 1), new Img(21, 23, 10, 14, 20, 1)],
      },
      {
        box: new Box(7, 10, 185, 7),
        imgs: [new Img(2, 18, 2, 13, 23, 1)],
      },
      {
        box: new Box(2, 22, 197, 22),
        imgs: [
          new Img(5, 29, 2, 20, 21, 1),
          new Img(1, 15, 24, 14, 24, 1),
          new Img(15, 29, 30, 14, 22, 2),
        ],
      },
      {
        box: new Box(2, 22, 226, 22),
        imgs: [
          new Img(25, 19, 2, 17, 25, 2),
          new Img(3, 25, 8, 22, 26, 1),
          new Img(16, 26, 32, 13, 29, 1),
        ],
      },
      {
        box: new Box(2, 21, 254, 18),
        imgs: [new Img(12, 30, 2, 18, 27, 1), new Img(3, 17, 22, 15, 28, 1)],
      },
      {
        box: new Box(9, 10, 277, 8),
        imgs: [new Img(2, 18, 2, 14, 30, 1)],
      },
      {
        box: new Box(5, 9, 283, 7),
        imgs: [new Img(2, 16, 2, 12, 31, 1)],
      },
      {
        box: new Box(2, 21, 295, 23),
        imgs: [
          new Img(12, 26, 2, 14, 32, 2),
          new Img(1, 18, 14, 16, 35, 1),
          new Img(14, 28, 32, 14, 36, 1),
        ],
      },
      {
        box: new Box(4, 20, 324, 13),
        imgs: [new Img(2, 22, 2, 14, 34, 2), new Img(13, 26, 14, 12, 33, 1)],
      },
      {
        box: new Box(2, 22, 342, 19),
        imgs: [
          new Img(25, 20, 1, 17, 39, 1),
          new Img(1, 30, 14, 12, 38, 2),
          new Img(21, 24, 26, 12, 37, 1),
        ],
      },
      {
        box: new Box(3, 19, 365, 18),
        imgs: [new Img(2, 21, 2, 13, 41, 1), new Img(14, 24, 16, 20, 40, 1)],
      },
      {
        box: new Box(7, 10, 388, 8),
        imgs: [new Img(2, 18, 2, 14, 42, 1)],
      },
      {
        box: new Box(2, 22, 403, 21),
        imgs: [
          new Img(28, 16, 2, 13, 43, 1),
          new Img(1, 15, 10, 13, 44, 1),
          new Img(25, 19, 22, 9, 45, 2),
          new Img(5, 25, 28, 14, 47, 1),
        ],
      },
      {
        box: new Box(12, 10, 430, 9),
        imgs: [new Img(1, 19, 2, 15, 46, 1)],
      },
      {
        box: new Box(2, 16, 441, 8),
        imgs: [new Img(2, 31, 2, 15, 49, 1)],
      },
      {
        box: new Box(7, 17, 453, 14),
        imgs: [new Img(13, 31, 2, 15, 48, 1), new Img(2, 18, 14, 14, 50, 2)],
      },
      {
        box: new Box(3, 22, 471, 18),
        imgs: [new Img(18, 26, 2, 16, 52, 1), new Img(4, 19, 20, 17, 51, 1)],
      },
      {
        box: new Box(10, 13, 493, 6),
        imgs: [new Img(2, 24, 2, 11, 53, 1)],
      },
      {
        box: new Box(6, 11, 503, 10),
        imgs: [new Img(2, 20, 2, 18, 54, 1)],
      },
    ];
  } else {
    sections = [
      {
        box: new Box(10, 12, 3, 12), // Box Params: Col Start, Col Span, Row Start, Row Span
        imgs: [
          new Img(1, 12, 1, 20, 1, 1), // Img Params: Col Start, Col Span, Row Start, Row Span, Img Src, Speed, Z-Index
          new Img(14, 10, 10, 14, 2, 1),
        ],
      },
      {
        box: new Box(33, 15, 4, 15),
        imgs: [
          new Img(1, 9, 1, 8, 3, 1),
          new Img(22, 8, 2, 10, 4, 1),
          new Img(9, 10, 9, 14, 5, 1),
          new Img(5, 7, 22, 9, 6, 1),
        ],
      },
      {
        box: new Box(3, 13, 21, 10),
        imgs: [
          new Img(11, 9, 1, 10, 7, 2),
          new Img(1, 11, 7, 12, 8, 1),
          new Img(15, 12, 11, 10, 9, 1),
        ],
      },
      {
        box: new Box(27, 5, 24, 9),
        imgs: [new Img(1, 10, 2, 18, 10, 1)],
      },
      {
        box: new Box(36, 9, 38, 8),
        imgs: [new Img(1, 9, 4, 13, 11, 1), new Img(11, 7, 1, 12, 12, 1)],
      },
      {
        box: new Box(8, 10, 44, 11),
        imgs: [new Img(7, 13, 1, 12, 13, 2), new Img(1, 15, 9, 14, 14, 1)],
      },
      {
        box: new Box(25, 4, 50, 5),
        imgs: [new Img(2, 7, 2, 8, 15, 1)],
      },
      {
        box: new Box(35, 13, 55, 13),
        imgs: [
          new Img(15, 11, 1, 13, 16, 1),
          new Img(1, 10, 8, 12, 17, 1),
          new Img(12, 8, 14, 12, 18, 1),
        ],
      },
      {
        box: new Box(15, 12, 65, 8),
        imgs: [new Img(1, 11, 1, 12, 19, 1), new Img(13, 11, 4, 12, 20, 1)],
      },
      {
        box: new Box(2, 13, 79, 15),
        imgs: [
          new Img(3, 13, 1, 16, 21, 2),
          new Img(13, 13, 13, 12, 22, 1),
          new Img(1, 7, 19, 12, 24, 1),
        ],
      },
      {
        box: new Box(28, 10, 82, 6),
        imgs: [new Img(2, 9, 1, 12, 23, 1)],
      },
      {
        box: new Box(38, 10, 91, 21),
        imgs: [
          new Img(11, 9, 2, 14, 25, 2),
          new Img(1, 12, 13, 18, 26, 1),
          new Img(6, 12, 32, 12, 29, 1),
        ],
      },
      {
        box: new Box(12, 13, 101, 10),
        imgs: [new Img(1, 15, 1, 16, 27, 1), new Img(18, 8, 8, 14, 28, 1)],
      },
      {
        box: new Box(4, 4, 121, 6),
        imgs: [new Img(1, 7, 2, 10, 31, 1)],
      },
      {
        box: new Box(32, 5, 117, 7),
        imgs: [new Img(1, 9, 2, 12, 30, 1)],
      },
      {
        box: new Box(10, 12, 129, 17),
        imgs: [
          new Img(7, 12, 2, 12, 32, 2),
          new Img(1, 8, 12, 14, 35, 1),
          new Img(10, 14, 22, 14, 36, 1),
        ],
      },
      {
        box: new Box(35, 12, 130, 9),
        imgs: [new Img(13, 12, 2, 10, 33, 1), new Img(1, 10, 7, 12, 34, 1)],
      },
      {
        box: new Box(30, 16, 148, 10),
        imgs: [
          new Img(10, 11, 2, 10, 37, 2),
          new Img(1, 14, 10, 10, 38, 1),
          new Img(23, 9, 6, 14, 39, 1),
        ],
      },
      {
        box: new Box(3, 11, 155, 11),
        imgs: [new Img(12, 11, 1, 16, 40, 1), new Img(1, 10, 12, 12, 41, 1)],
      },
      {
        box: new Box(21, 5, 166, 7),
        imgs: [new Img(1, 9, 2, 14, 42, 1)],
      },
      {
        box: new Box(35, 11, 169, 16),
        imgs: [
          new Img(16, 7, 1, 10, 43, 1),
          new Img(1, 7, 8, 10, 44, 1),
          new Img(13, 9, 17, 8, 45, 2),
          new Img(3, 11, 22, 12, 47, 1),
        ],
      },
      {
        box: new Box(2, 5, 179, 7),
        imgs: [new Img(1, 9, 2, 14, 46, 1)],
      },
      {
        box: new Box(13, 17, 188, 12),
        imgs: [
          new Img(6, 10, 2, 14, 48, 1),
          new Img(19, 15, 8, 14, 49, 1),
          new Img(2, 10, 12, 14, 50, 1),
        ],
      },
      {
        box: new Box(36, 12, 201, 10),
        imgs: [new Img(1, 9, 2, 14, 51, 1), new Img(12, 12, 7, 14, 52, 1)],
      },
      {
        box: new Box(3, 6, 209, 5),
        imgs: [new Img(1, 11, 2, 10, 53, 1)],
      },
      {
        box: new Box(24, 10, 213, 7),
        imgs: [new Img(1, 9, 1, 14, 54, 1)],
      },
    ];
  }

  // Checking image container viewport starts here
  const observer = new IntersectionObserver(handleIntersection, {
    threshold: buildThresholdList(),
  });

  function buildThresholdList() {
    let thresholds = [];
    const numSteps = 80.0;

    for (let i = 1.0; i <= numSteps; i++) {
      let ratio = i / numSteps;
      thresholds.push(ratio);
    }

    thresholds.push(0);
    return thresholds;
  }

  function handleIntersection(entries) {
    entries.map((entry) => {
      if (entry.isIntersecting) {
        if (entry.intersectionRatio > 0.7) {
          entry.target.dataset.visible = 1;
          entry.target.classList.add("visible");
        }
      } else {
        entry.target.dataset.visible = 0;
        entry.target.classList.remove("visible");
      }
    });
  }
  // Checking image container viewport ends here

  // Elements Rendering Starts Here
  sections.forEach((section) => {
    const box = section.box;
    const imgs = section.imgs;

    imgs.forEach((img) => {
      box.addImage(img.DOM.imgContainer);

      observer.observe(img.DOM.imgContainer);

      img.init();
    });

    images.push(...imgs);

    images.sort(dynamicSort("imageNo"));
  });
  // Elements Rendering Starts Here

  // Animation Starts Here
  const updater = function () {
    images.forEach((img) => {
      img.animate();
    });
    animation = requestAnimationFrame(updater); // for subsequent frames
  };
  // Animation Ends Here

  // Initial Load Starts Here
  const preload = Preload();

  preload.fetch(initLoad[randLoad].imgs).then((imgs) => {
    let invisibleImages = [];

    let loadedImgs = imgs.map((i) => {
      return i.fileName.slice(0, -4);
    });

    loadedImgs.forEach((img) => {
      const i = images[parseInt(img) - 1].DOM.img;
      invisibleImages.push(i);
    });

    shuffle(invisibleImages);

    const body = document.querySelector("body");
    startAnimation();
    setTimeout(() => {
      stopAnimation();
      body.classList.remove("loading");
      body.classList.add("loaded");

      TweenMax.staggerFrom(
        invisibleImages,
        invisibleImages.length * 0.2,
        { opacity: 0, ease: Power3.easeOut },
        0.3
      ).then(function () {
        startAnimation();
      });
    }, 1000);
  });
  // Initial Load Ends Here

  // Image Containers Mouse Hover Starts Here
  function mouseOver() {
    stopAnimation();
    images.forEach((img) => {
      img.addBlur();
    });
  }
  function mouseOut() {
    startAnimation();
    images.forEach((img) => {
      img.removeBlur();
    });
  }
  // Image Containers Mouse Hover Ends Here

  // Mouse Tracking Starts Here
  (function () {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
      var eventDoc, doc, body;

      event = event || window.event; // IE-ism

      // If pageX/Y aren't available and clientX/Y are,
      // calculate pageX/Y - logic taken from jQuery.
      // (This is to support old IE)
      if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX =
          event.clientX +
          ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
          ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
        event.pageY =
          event.clientY +
          ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
          ((doc && doc.clientTop) || (body && body.clientTop) || 0);
      }

      mouseX = event.pageX;
      mouseY = event.pageY;
    }
  })();
  // Mouse Tracking Ends Here

  // Wheel Tracking Code Starts Here
  window.addEventListener("DOMMouseScroll", wheel, false);
  window.addEventListener("mousewheel", wheel, false);

  function wheel(e) {
    event = e;
    counter1 += 1;
    delta = e.deltaY;
    if (delta > 0) {
      direction = "up";
    } else {
      direction = "down";
    }
    if (marker) {
      // wheelStart
      marker = false;
      wheelAct();
      // wheelStart
    }
    return false;
  }
  function wheelAct() {
    counter2 = counter1;
    setTimeout(function () {
      if (counter2 == counter1) {
        // wheelEnd
        images.forEach((image) => image.changeSpeed(0));
        marker = true;
        counter1 = 0;
        counter2 = false;
        // wheelEnd
      } else {
        let { pixelY } = scrollnormalizeWheel(event);
        images.forEach((image) => image.changeSpeed(pixelY));
        wheelAct();
      }
    }, interval);
  }
  function scrollnormalizeWheel(event) {
    let sX = 0,
      sY = 0, // spinX, spinY
      pX = 0,
      pY = 0; // pixelX, pixelY

    // Legacy
    if ("detail" in event) {
      sY = event.detail;
    }
    if ("wheelDelta" in event) {
      sY = -event.wheelDelta / 120;
    }
    if ("wheelDeltaY" in event) {
      sY = -event.wheelDeltaY / 120;
    }
    if ("wheelDeltaX" in event) {
      sX = -event.wheelDeltaX / 120;
    }

    // side scrolling on FF with DOMMouseScroll
    if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
      sX = sY;
      sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ("deltaY" in event) {
      pY = event.deltaY;
    }
    if ("deltaX" in event) {
      pX = event.deltaX;
    }

    if ((pX || pY) && event.deltaMode) {
      if (event.deltaMode == 1) {
        // delta in LINE units
        pX *= LINE_HEIGHT;
        pY *= LINE_HEIGHT;
      } else {
        // delta in PAGE units
        pX *= PAGE_HEIGHT;
        pY *= PAGE_HEIGHT;
      }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) {
      sX = pX < 1 ? -1 : 1;
    }
    if (pY && !sY) {
      sY = pY < 1 ? -1 : 1;
    }

    return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
  }
  // Wheel Tracking Code Ends Here

  function stopAnimation() {
    cancelAnimationFrame(animation);
  }

  function startAnimation() {
    cancelAnimationFrame(animation);
    animation = requestAnimationFrame(updater);
  }

  // Helper Methods

  function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }
});
