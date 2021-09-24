# GASを利用するためのインポート
import json
import discord
import requests

# Bot Commands Frameworkのインポート
from discord.ext import commands


class BasicCommands(commands.Cog, name="基本コマンド"):
    """
    基本的なコマンドです。
    """
    # BasicCommandsのコンストラクタ。Botを受取り、インスタンス変数として保持。
    def __init__(self, bot):
        self.bot = bot

    @commands.command(description="生存確認")
    async def ping(self, ctx):
        await ctx.send('我は不滅だ……')


# コグとして用いるクラスを定義。
class BossTime(commands.Cog, name="リネ2Mボス時間管理"):
    """
    ボス時間管理用です。
    """
    # BossTimeのコンストラクタ。Botを受取り、インスタンス変数として保持。
    def __init__(self, bot):
        self.bot = bot

    # コマンドの作成。コマンドはcommandデコレータで必ず修飾する。
    @commands.command(description="BOSS時間の更新や表示をします。\n\n"
                                  "!bのみ入力でボス予定表の表示です。\n\n"
                                  "!b␣[BOSS名]␣[時間(hh:mm)]　と入力すると時間を更新します。\n"
                                  "!b␣[BOSS名]␣[時間(hh:mm)]␣[メモ]　と入力すると時間と前回湧き位置を更新します。\n"
                                  "[メモ]がない場合、デフォルトで”NoData”となります。\n"
                                  "括弧は入力不要です。␣は空白です。\n\n"
                                  "!b␣メンテ␣[時間(hh:mm)]と入力すると全ての討伐時間をリセットします。\n"
                                  "リセット時間を入力しない場合”04:50”がデフォルトで入ります。")
    async def b(self, ctx, b_name='NoData', b_time='04:50', b_position='NoData'):
        """
        ボス時間の更新や表示を行います。
        """
        if b_name == 'NoData':
            payload = {
                "bossName": '',
                "hhmm": '',
                "position": '',
                "callFrom": 'getList'
            }
        elif b_name == 'メンテ':
            payload = {
                "bossName": '',
                "hhmm": b_time,
                "position": '',
                "callFrom": 'reSet'
            }
        else:
            payload = {
                "bossName": b_name,
                "hhmm": b_time,
                "position": b_position,
                "callFrom": ''
            }

        url = "https://script.google.com/macros/s/" \
              "AKfycbwMmNHseRhas8k6rDWZ_QymMQrEbPChhXdY4o-mhCIPDZLj9yU5EVBqVYn6qKCBRTTh4Q/exec"

        headers = {
            'Content-Type': 'application/json',
        }

        response = requests.post(url, data=json.dumps(payload), headers=headers)

        try:
            resmsg = response.json()
        except ValueError as e:
            await ctx.send("入力形式が間違っているのではないか……？")
            print(e)
            print(response.text)
            return False
        else:
            if resmsg["title"] == '更新成功！':
                embed = discord.Embed(
                    title=resmsg["title"],
                    colour=resmsg["color"],
                    description=resmsg["content"]
                )
                embed.set_author(name=resmsg["username"],
                                 icon_url=resmsg["avatar_url"]
                                 )
                embed.set_thumbnail(url=resmsg["thumbnail_url"])
                embed.add_field(name=resmsg["name"], value=resmsg["time"])
                embed.add_field(name="メモ", value=resmsg["memo"])

            elif resmsg["title"] == '更新失敗……':
                embed = discord.Embed(
                    title=resmsg["title"],
                    colour=resmsg["color"],
                    description=resmsg["content"]
                )
                embed.set_thumbnail(url=resmsg["thumbnail_url"])
                embed.set_author(name=resmsg["username"],
                                 icon_url=resmsg["avatar_url"]
                                 )

            elif resmsg["title"] == 'List':
                await ctx.send(resmsg["data"])
                return

            else:
                embed = discord.Embed(
                    title=resmsg["title"],
                    colour=resmsg["color"],
                    description=resmsg["content"]
                )
                embed.set_author(name=resmsg["username"],
                                 icon_url=resmsg["avatar_url"]
                                 )

            await ctx.send(embed=embed)

            # print(resmsg)
            return True

# Bot本体側からコグを読み込む際に呼び出される関数。
def setup(bot):
    # SlnCogにBotを渡してインスタンス化し、Botにコグとして登録する。
    bot.add_cog(BasicCommands(bot))
    bot.add_cog(BossTime(bot))
