const paymentFailedTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>PIF | Payment Error</title>
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
          stroke="#FF0033"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </div>

      <h1>Oops! Payment failed</h1>
      <p>Try again!</p>
    </div>
  </body>
</html>
`;

export default paymentFailedTemplate;
