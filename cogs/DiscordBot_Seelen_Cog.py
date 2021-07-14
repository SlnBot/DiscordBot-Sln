# GASを利用するためのインポート
import json
import requests

# Bot Commands Frameworkのインポート
from discord.ext import commands


# コグとして用いるクラスを定義。
class SlnCog(commands.Cog, name="リネ2M"):

    # SlnCogクラスのコンストラクタ。Botを受取り、インスタンス変数として保持。
    def __init__(self, bot):
        self.bot = bot

    # コマンドの作成。コマンドはcommandデコレータで必ず修飾する。
    @commands.command(descriotion="生存確認")
    async def ping(self, ctx):
        await ctx.send('我は不滅だ……')

    @commands.command(description="BOSS時間の更新や表示をします。\n\n"
                                  "!bのみ入力でボス予定表の表示です。\n\n"
                                  "!b␣[BOSS名]␣[時間(hh:mm)]で入力すると時間を更新します。\n"
                                  "括弧は入力不要です。␣は空白です。\n\n"
                                  "!b␣メンテ␣[時間(hh:mm)]と入力すると全ての討伐時間をリセットします。\n"
                                  "リセット時間を入力しない場合6:50がデフォルトで入ります。")
    async def b(self, ctx, b_name='NoData', b_time='06:50'):

        if b_name == 'NoData':
            payload = {
                "bossName": '',
                "hhmm": '',
                "callFrom": 'getList'
            }
        elif b_name == 'メンテ':
            payload = {
                "bossName": '',
                "hhmm": b_time,
                "callFrom": 'reSet'
            }
        else:
            payload = {
                "bossName": b_name,
                "hhmm": b_time,
                "callFrom": ''
            }

        url = "https://script.google.com/macros/s/" \
              "AKfycbzOmoOoyl2lBS-tkn9AmDF7HnHSWSMndjhgT4JlJvGqSn9lEJpcDqrvl0PQhFrfkYsYKA/exec"

        headers = {
            'Content-Type': 'application/json',
        }

        response = requests.post(url, data=json.dumps(payload), headers=headers)

        try:
            resMsg = response.json()
        except ValueError as e:
            await ctx.send("入力形式が間違っているのではないか……？")
            print(e)
            return False
        else:
            # print(resMsg["data"])
            await ctx.send("【" + resMsg["data"] + "】とハンゾー君が申しておる。")
            return True


# Bot本体側からコグを読み込む際に呼び出される関数。
def setup(bot):
    # SlnCogにBotを渡してインスタンス化し、Botにコグとして登録する。
    bot.add_cog(SlnCog(bot))
    
