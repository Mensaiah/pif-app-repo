const paymentSuccessTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>PIF | Payment Success</title>
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      }
      h1 {
        font-size: 3.5rem;
      }
      p {
        font-size: 2rem;
      }
      @media (max-width: 640px) {
        h1 {
          font-size: 2rem;
        }
        p {
          font-size: 1rem;
        }
      }
    </style>
  </head>
  <body>
    <div
      style="
        max-height: 100vh;
        padding-top: 10rem;
        max-width: 100vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-content: center;
      "
    >
      <div style="width: 6rem; height: 6rem;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="#4DB0AD"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      </div>

      <h1>Payment completed</h1>
      <p>Thank you for your purchase!</p>
    </div>
  </body>
</html>
`;

export default paymentSuccessTemplate;
